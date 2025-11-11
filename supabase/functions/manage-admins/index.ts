import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateAdminRequest {
  email: string;
  password: string;
}

interface ResetPasswordRequest {
  userId: string;
  password: string;
}

interface DeleteAdminRequest {
  userId: string;
  email: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-my-custom-header': 'manage-admins'
        }
      }
    });

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: adminCheck } = await supabaseAdmin
      .from('admin_users')
      .select('is_boss')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminCheck || !adminCheck.is_boss) {
      return new Response(
        JSON.stringify({ error: 'Only BOSS admin can perform this action' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'create' && req.method === 'POST') {
      const { email, password } = await req.json() as CreateAdminRequest;

      console.log('Creating admin with email:', email);

      const { error: approvedError } = await supabaseAdmin
        .from('approved_emails')
        .insert([{
          email,
          is_active: true
        }]);

      if (approvedError && approvedError.code !== '23505') {
        console.error('Approved emails insert error:', approvedError);
        return new Response(
          JSON.stringify({ error: `Approved emails failed: ${approvedError.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('Email added to approved_emails');

      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        await supabaseAdmin.from('approved_emails').delete().eq('email', email);
        return new Response(
          JSON.stringify({ error: `Sign up failed: ${signUpError.message}` }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log('User created:', signUpData.user.id);

      const { error: adminUpdateError } = await supabaseAdmin
        .from('admin_users')
        .update({
          is_boss: false,
          needs_password_change: true,
          created_by: user.id
        })
        .eq('user_id', signUpData.user.id);

      if (adminUpdateError) {
        console.error('Admin users update error:', adminUpdateError);
      }

      console.log('Admin user configured successfully');

      return new Response(
        JSON.stringify({ success: true, userId: signUpData.user.id }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'reset-password' && req.method === 'POST') {
      const { userId, password } = await req.json() as ResetPasswordRequest;

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: dbError } = await supabaseAdmin
        .from('admin_users')
        .update({ needs_password_change: true })
        .eq('user_id', userId);

      if (dbError) {
        return new Response(
          JSON.stringify({ error: dbError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'delete' && req.method === 'POST') {
      const { userId, email } = await req.json() as DeleteAdminRequest;

      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteAuthError) {
        return new Response(
          JSON.stringify({ error: deleteAuthError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: deleteApprovedError } = await supabaseAdmin
        .from('approved_emails')
        .delete()
        .eq('email', email);

      if (deleteApprovedError) {
        return new Response(
          JSON.stringify({ error: deleteApprovedError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: deleteAdminError } = await supabaseAdmin
        .from('admin_users')
        .delete()
        .eq('user_id', userId);

      if (deleteAdminError) {
        return new Response(
          JSON.stringify({ error: deleteAdminError.message }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});