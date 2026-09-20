-- Create enum types
CREATE TYPE public.role_enum AS ENUM ('superadmin', 'customer');
CREATE TYPE public.order_status AS ENUM ('PENDING_PAYMENT_VERIFICATION', 'PAYMENT_REJECTED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE public.payment_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE_TYPE public.support_status AS ENUM ('OPEN', 'PENDING', 'RESOLVED', 'CLOSED');
CREATE_TYPE public.support_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role public.role_enum DEFAULT 'customer',
  phone_number TEXT,
  gender TEXT,
  city TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  original_price INTEGER NOT NULL,
  sale_price INTEGER,
  stock INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  category_id UUID REFERENCES public.categories ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policy: users can view active published products
CREATE POLICY "Users can view active products" ON public.products
  FOR SELECT USING (is_published = true);

-- Create product_images table
CREATE TABLE public.product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  path TEXT NOT NULL,
  alt_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create policy: users can view product images
CREATE POLICY "Users can view product images" ON public.product_images
  FOR SELECT USING (true);

-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description_en TEXT,
  description_ar TEXT,
  account_identifier TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create shipping_methods table
CREATE TABLE public.shipping_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT,
  base_price INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default shipping methods
INSERT INTO public.shipping_methods (name_en, name_ar, description, base_price, is_active, sort_order)
VALUES 
  ('Standard Delivery', 'التوصيل القياسي', 'Standard shipping', 50, true, 1),
  ('Express Delivery', 'التوصيل السريع', 'Express shipping', 100, true, 2);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  status public.order_status DEFAULT 'PENDING_PAYMENT_VERIFICATION',
  payment_status public.payment_status DEFAULT 'PENDING',
  subtotal INTEGER DEFAULT 0,
  shipping_cost INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  city TEXT,
  address TEXT,
  payment_method TEXT,
  shipping_method TEXT,
  receipt_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy: users can read own orders
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: admins can manage orders
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  original_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE,
  payment_method_id UUID REFERENCES public.payment_methods ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  status public.payment_status DEFAULT 'PENDING',
  receipt_url TEXT,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policy: users can read own payments
CREATE POLICY "Users can read own payments" ON public.payments
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.orders WHERE id = order_id));

-- Create policy: admins can manage payments
CREATE POLICY "Admins can manage payments" ON public.payments
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  product_id UUID REFERENCES public.products ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlist_items
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- Create policy: users can manage own wishlist
CREATE POLICY "Users can manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status public.support_status DEFAULT 'OPEN',
  priority public.support_priority DEFAULT 'NORMAL',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on support_tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policy: users can read own tickets
CREATE POLICY "Users can read own tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: admins can manage tickets
CREATE POLICY "Admins can manage tickets" ON public.support_tickets
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Create support_messages table
CREATE TABLE public.support_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets ON DELETE CASCADE,
  sender_id UUID,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Create policy: users can manage own messages
CREATE POLICY "Users can manage own messages" ON public.support_messages
  FOR ALL USING (auth.uid() = sender_id OR EXISTS (
    SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()
  ));

-- Create policy: admins can manage all messages
CREATE POLICY "Admins can manage all messages" ON public.support_messages
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Insert default payment methods
INSERT INTO public.payment_methods (name_en, name_ar, description_en, description_ar, is_active, sort_order)
VALUES 
  ('Vodafone Cash', 'فودافون كاش', 'Pay via Vodafone Cash', 'الدفع عبر فودافون كاش', true, 1),
  ('InstaPay', 'إنستا باي', 'Pay via InstaPay', 'الدفع عبر إنستا باي', true, 2),
  ('Bank Transfer', 'تحويل بنكي', 'Pay via bank transfer', 'الدفع عبر تحويل بنكي', true, 3);

-- Grant permissions
GRANT ALL ON ALL TABLES TO authenticated;
GRANT ALL ON ALL SEQUENCES TO authenticated;
GRANT USAGE, SELECT ON ALL TABLES TO anon;