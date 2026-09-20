CREATE OR REPLACE FUNCTION public.approve_order_payment(
  p_order_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  order_status public.order_status,
  payment_status public.payment_status,
  message TEXT,
  new_stocks JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_current_stock INTEGER;
  v_new_stock INTEGER;
  v_result JSONB := '[]'::JSONB;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;

  IF v_order IS NULL THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, NULL::public.order_status, NULL::public.payment_status,
      'Order not found'::TEXT, '[]'::JSONB;
    RETURN;
  END IF;

  IF v_order.payment_status != 'PENDING' THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, v_order.status, v_order.payment_status,
      'Order payment already reviewed'::TEXT, '[]'::JSONB;
    RETURN;
  END IF;

  -- Iterate order items and decrement stock
  FOR v_item IN
    SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    SELECT stock INTO v_current_stock FROM public.products WHERE id = v_item.product_id;

    IF v_current_stock IS NULL THEN
      RAISE EXCEPTION 'Product not found: %', v_item.product_id;
    END IF;

    IF v_current_stock < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %: requested %, available %',
        v_item.product_id, v_item.quantity, v_current_stock;
    END IF;

    v_new_stock := v_current_stock - v_item.quantity;
    UPDATE public.products SET stock = v_new_stock, updated_at = now() WHERE id = v_item.product_id;

    v_result := v_result || jsonb_build_object(
      'product_id', v_item.product_id,
      'new_stock', v_new_stock
    );
  END LOOP;

  -- Update order
  UPDATE public.orders SET
    status = 'PROCESSING',
    payment_status = 'APPROVED',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE id = p_order_id;

  -- Update payment records
  UPDATE public.payments SET
    status = 'APPROVED',
    reviewed_by = auth.uid(),
    reviewed_at = now(),
    updated_at = now()
  WHERE order_id = p_order_id;

  RETURN QUERY SELECT TRUE::BOOLEAN, 'PROCESSING'::public.order_status, 'APPROVED'::public.payment_status,
    'Payment approved and stock decremented'::TEXT, v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN QUERY SELECT FALSE::BOOLEAN, NULL::public.order_status, NULL::public.payment_status,
      SQLERRM::TEXT, '[]'::JSONB;
END;
$$;
