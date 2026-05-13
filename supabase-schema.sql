-- ============================================
-- 雾隐青山博客 - Supabase 数据库结构
-- ============================================

-- 1. 访问记录表
CREATE TABLE analytics (
    id BIGSERIAL PRIMARY KEY,
    path VARCHAR(255) NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    device VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_size VARCHAR(50),
    language VARCHAR(20),
    ip_hash VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 访问记录索引
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX idx_analytics_path ON analytics(path);

-- 2. 博客文章表
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    cover_image TEXT,
    category VARCHAR(100),
    tags TEXT[],
    author VARCHAR(100) DEFAULT 'Yaron',
    read_time INTEGER DEFAULT 5,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文章索引
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_published ON posts(published);

-- 3. 访客留言表
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    content TEXT NOT NULL,
    ip_hash VARCHAR(64),
    read BOOLEAN DEFAULT false,
    replied BOOLEAN DEFAULT false,
    reply_content TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 留言索引
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- 4. 资讯表
CREATE TABLE news (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    url TEXT,
    hot BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 资讯索引
CREATE INDEX idx_news_category ON news(category);
CREATE INDEX idx_news_hot ON news(hot);

-- 5. 管理员表
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    avatar TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) 配置
-- ============================================

-- 启用 RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public can read posts" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Public can read news" ON news FOR SELECT USING (true);
CREATE POLICY "Public can create messages" ON messages FOR INSERT WITH CHECK (true);

-- 管理员策略 (需要认证)
CREATE POLICY "Admin can do anything" ON posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do anything" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do anything" ON news FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can do anything" ON analytics FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 函数和触发器
-- ============================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 文章更新时自动更新 updated_at
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 初始数据
-- ============================================

-- 添加默认管理员 (密码: admin123 - 请在生产环境修改)
-- 密码哈希使用 bcrypt，请使用实际的哈希值
INSERT INTO admins (email, password_hash, name) VALUES 
('admin@wuyinqingshan.com', '$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'Yaron');
