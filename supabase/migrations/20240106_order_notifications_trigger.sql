-- ============================================================
-- 20240106 — Order notifications trigger + order_id on notifications
-- ============================================================

-- Add order_id column to notifications
DO $$ BEGIN
  ALTER TABLE public.notifications ADD COLUMN order_id UUID REFERENCES public.orders ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ============================================================
-- Automated notification trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_order_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_order_number TEXT;
  v_title TEXT;
  v_message TEXT;
  v_link TEXT;
BEGIN
  -- Only fire when status actually changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  v_order_number := '#' || UPPER(SUBSTRING(NEW.id::text FROM 1 FOR 8));
  v_link := '/account/orders/' || NEW.id;

  CASE NEW.status
    WHEN 'PROCESSING' THEN
      v_title := 'طلبك قيد التحضير';
      v_message := 'تم إثبات دفع طلبك رقم ' || v_order_number || ' وهو الآن قيد التحضير.';
    WHEN 'SHIPPED' THEN
      v_title := 'طلبك في الطريق إليك';
      v_message := 'تم شحن طلبك رقم ' || v_order_number || ' وهو في طريقه إليك الآن!';
    WHEN 'DELIVERED' THEN
      v_title := 'تم توصيل طلبك';
      v_message := 'تم توصيل طلبك رقم ' || v_order_number || ' بنجاح. نتمنى لك تجربة ممتعة!';
    WHEN 'CANCELLED' THEN
      v_title := 'تم إلغاء طلبك';
      v_message := 'تم إلغاء طلبك رقم ' || v_order_number || '. يرجى مراجعة التفاصيل أو التواصل مع الدعم.';
    WHEN 'PAYMENT_REJECTED' THEN
      v_title := 'تم رفض دفع طلبك';
      v_message := 'تم رفض دفع طلبك رقم ' || v_order_number || '. يرجى مراجعة التفاصيل أو التواصل مع الدعم.';
    ELSE
      RETURN NEW;
  END CASE;

  INSERT INTO public.notifications (user_id, title, message, type, link, order_id)
  VALUES (NEW.user_id, v_title, v_message, 'order', v_link, NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old trigger if exists, then create
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_order_status_notification();
