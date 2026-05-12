import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/Home/HomePage'
import ProductListPageApi from './pages/ProductList/ProductListPageApi'
import ProductDetailPageApi from './pages/ProductDetail/ProductDetailPageApi'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import CartPageApi from './pages/Cart/CartPageApi'
import CheckoutPageApi from './pages/Checkout/CheckoutPageApi'
import AdminLaptopPageApi from './pages/Admin/AdminLaptopPageApi'
import AdminOrderPage from './pages/Admin/AdminOrderPage'
import AdminUserPageApi from './pages/Admin/AdminUserPageApi'
import AdminBrandPageApi from './pages/Admin/AdminBrandPageApi'
import AdminDashboardPage from './pages/Admin/AdminDashboardPage'
import RequireAdmin from './components/auth/RequireAdmin'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<HomePage />} />
					<Route path='/laptops' element={<ProductListPageApi />} />
					<Route path='/laptops/:id' element={<ProductDetailPageApi />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path='/register' element={<RegisterPage />} />
					<Route path='/cart' element={<CartPageApi />} />
					<Route path='/checkout' element={<CheckoutPageApi />} />
					<Route
						path='/admin'
						element={
							<RequireAdmin>
								<Navigate to='/admin/dashboard' replace />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/dashboard'
						element={
							<RequireAdmin>
								<AdminDashboardPage />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/laptops'
						element={
							<RequireAdmin>
								<AdminLaptopPageApi />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/brands'
						element={
							<RequireAdmin>
								<AdminBrandPageApi />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/orders'
						element={
							<RequireAdmin>
								<AdminOrderPage />
							</RequireAdmin>
						}
					/>
					<Route
						path='/admin/users'
						element={
							<RequireAdmin>
								<AdminUserPageApi />
							</RequireAdmin>
						}
					/>
			</Routes>
		</BrowserRouter>
	)
}

export default App
