{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Universal Database Test Configuration",
  "description": "Configuration file for universal-db-test package",
  
  "examples": {
    "postgresql": {
      "database": {
        "type": "postgresql",
        "connectionString": "${DATABASE_URL}",
        "ssl": true
      },
      "tableName": "db_connection_test",
      "autoCreateTable": true,
      "cleanupAfterTest": true,
      "timeoutMs": 30000,
      "retryAttempts": 3,
      "silent": false
    },
    
    "supabase": {
      "database": {
        "type": "supabase",
        "supabaseUrl": "${NEXT_PUBLIC_SUPABASE_URL}",
        "supabaseKey": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}",
        "supabaseServiceKey": "${SUPABASE_SERVICE_ROLE_KEY}"
      },
      "tableName": "db_connection_test",
      "autoCreateTable": true,
      "cleanupAfterTest": true,
      "timeoutMs": 30000,
      "retryAttempts": 3
    },
    
    "mysql": {
      "database": {
        "type": "mysql",
        "host": "${DB_HOST}",
        "port": "${DB_PORT}",
        "database": "${DB_NAME}",
        "username": "${DB_USER}",
        "password": "${DB_PASSWORD}",
        "ssl": false
      },
      "tableName": "db_connection_test",
      "autoCreateTable": true,
      "cleanupAfterTest": true
    },
    
    "mongodb": {
      "database": {
        "type": "mongodb",
        "connectionString": "${MONGODB_URL}"
      },
      "tableName": "db_connection_test",
      "autoCreateTable": true,
      "cleanupAfterTest": true
    },
    
    "production_config": {
      "database": {
        "type": "postgresql",
        "connectionString": "${DATABASE_URL}",
        "ssl": true
      },
      "tableName": "health_check",
      "autoCreateTable": false,
      "cleanupAfterTest": false,
      "timeoutMs": 10000,
      "retryAttempts": 2,
      "silent": true,
      "beforeTest": null,
      "afterTest": null
    },
    
    "development_config": {
      "database": {
        "type": "postgresql",
        "host": "localhost",
        "port": 5432,
        "database": "myapp_dev",
        "username": "dev_user",
        "password": "dev_password",
        "ssl": false
      },
      "tableName": "db_test_dev",
      "autoCreateTable": true,
      "cleanupAfterTest": true,
      "timeoutMs": 60000,
      "retryAttempts": 5,
      "silent": false
    },
    
    "docker_config": {
      "database": {
        "type": "postgresql",
        "host": "db",
        "port": 5432,
        "database": "${POSTGRES_DB}",
        "username": "${POSTGRES_USER}",
        "password": "${POSTGRES_PASSWORD}",
        "ssl": false
      },
      "tableName": "container_health_check",
      "autoCreateTable": true,
      "cleanupAfterTest": false,
      "timeoutMs": 15000,
      "retryAttempts": 10
    },
    
    "ci_config": {
      "database": {
        "type": "postgresql",
        "connectionString": "${TEST_DATABASE_URL}",
        "ssl": false
      },
      "tableName": "ci_test_table",
      "autoCreateTable": true,
      "cleanupAfterTest": true,
      "timeoutMs": 20000,
      "retryAttempts": 3,
      "silent": true
    }
  },
  
  "recommended_configs": {
    "next_js_app": {
      "database": {
        "type": "supabase",
        "supabaseUrl": "${NEXT_PUBLIC_SUPABASE_URL}",
        "supabaseKey": "${NEXT_PUBLIC_SUPABASE_ANON_KEY}",
        "supabaseServiceKey": "${SUPABASE_SERVICE_ROLE_KEY}"
      },
      "tableName": "app_health_check",
      "autoCreateTable": true,
      "cleanupAfterTest": false,
      "timeoutMs": 30000,
      "retryAttempts": 3,
      "silent": false
    },
    
    "express_api": {
      "database": {
        "type": "postgresql",
        "connectionString": "${DATABASE_URL}",
        "ssl": true
      },
      "tableName": "api_health",
      "autoCreateTable": false,
      "cleanupAfterTest": false,
      "timeoutMs": 15000,
      "retryAttempts": 2,
      "silent": true
    },
    
    "microservice": {
      "database": {
        "type": "postgresql",
        "host": "${DB_HOST}",
        "port": "${DB_PORT}",
        "database": "${DB_NAME}",
        "username": "${DB_USER}",
        "password": "${DB_PASSWORD}",
        "ssl": true
      },
      "tableName": "service_health",
      "autoCreateTable": true,
      "cleanupAfterTest": false,
      "timeoutMs": 10000,
      "retryAttempts": 1,
      "silent": true
    }
  },
  
  "environment_templates": {
    "local_development": {
      "database": { "ssl": false },
      "autoCreateTable": true,
      "cleanupAfterTest": true,
      "timeoutMs": 60000,
      "retryAttempts": 5,
      "silent": false
    },
    
    "staging": {
      "database": { "ssl": true },
      "autoCreateTable": false,
      "cleanupAfterTest": false,
      "timeoutMs": 20000,
      "retryAttempts": 3,
      "silent": false
    },
    
    "production": {
      "database": { "ssl": true },
      "autoCreateTable": false,
      "cleanupAfterTest": false,
      "timeoutMs": 10000,
      "retryAttempts": 2,
      "silent": true
    }
  },
  
  "migration_templates": {
    "postgresql": "-- PostgreSQL Migration\nCREATE TABLE IF NOT EXISTS db_connection_test (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  test_message TEXT NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);\n\nCOMMENT ON TABLE db_connection_test IS 'Universal database connection test table';",
    
    "mysql": "-- MySQL Migration\nCREATE TABLE IF NOT EXISTS db_connection_test (\n  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),\n  test_message TEXT NOT NULL,\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);",
    
    "supabase_with_rls": "-- Supabase Migration with RLS\nCREATE TABLE IF NOT EXISTS public.db_connection_test (\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n  test_message TEXT NOT NULL,\n  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);\n\n-- Enable RLS\nALTER TABLE public.db_connection_test ENABLE ROW LEVEL SECURITY;\n\n-- Create policies\nCREATE POLICY \"Allow service role access\" ON public.db_connection_test\n  FOR ALL TO service_role USING (true);\n\nCREATE POLICY \"Allow authenticated read\" ON public.db_connection_test\n  FOR SELECT TO authenticated USING (true);"
  },
  
  "troubleshooting": {
    "common_issues": {
      "permission_denied": {
        "error": "permission denied for table db_connection_test",
        "solution": "Grant CREATE, SELECT, INSERT, DELETE permissions to your database user"
      },
      "connection_timeout": {
        "error": "Connection timeout after 30000ms",
        "solution": "Increase timeoutMs value or check network connectivity"
      },
      "table_not_found": {
        "error": "relation \"db_connection_test\" does not exist",
        "solution": "Set autoCreateTable: true or create the table manually"
      },
      "ssl_required": {
        "error": "SSL connection required",
        "solution": "Set ssl: true in your database configuration"
      }
    }
  }
}