-- Allow challengers to update their own pending disputes (to edit suggested_items)
CREATE POLICY "Challengers can update their own pending disputes"
  ON bill_disputes
  FOR UPDATE
  USING (challenger_id = auth.uid() AND status = 'pending')
  WITH CHECK (challenger_id = auth.uid() AND status = 'pending');
