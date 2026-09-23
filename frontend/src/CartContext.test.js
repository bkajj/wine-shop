import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from './CartContext';

function Probe() {
  const { cart, addToCart, clearCart } = useCart();
  return (
    <div>
      <span data-testid="count">{cart.length}</span>
      <button onClick={() => addToCart({ id: 1, name: 'Wino Czerwone', price: 49.99 })}>add</button>
      <button onClick={clearCart}>clear</button>
    </div>
  );
}

test('adds products to the cart and clears it', async () => {
  render(<CartProvider><Probe /></CartProvider>);

  await userEvent.click(screen.getByText('add'));
  await userEvent.click(screen.getByText('add'));
  expect(screen.getByTestId('count')).toHaveTextContent('2');

  await userEvent.click(screen.getByText('clear'));
  expect(screen.getByTestId('count')).toHaveTextContent('0');
});