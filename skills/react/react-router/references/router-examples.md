# Canonical setups

## React Router — declarative mode

```tsx
import { BrowserRouter, Routes, Route, Outlet, NavLink } from 'react-router'

function Layout() {
  return (
    <>
      <nav><NavLink to="/">Home</NavLink><NavLink to="/users">Users</NavLink></nav>
      <Outlet />
    </>
  )
}

createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="users/:userId" element={<UserDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>,
)
```

Read params with `useParams()`; navigate with `useNavigate()` or `<Link>`.

## React Router — data mode

```tsx
const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'users/:userId',
        loader: ({ params }) => fetchUser(params.userId!),
        element: <UserDetail />,
      },
    ],
  },
])

createRoot(root).render(<RouterProvider router={router} />)
```

`useLoaderData()` reads the loader result; the router starts the load before rendering the component, which removes the fetch-on-mount waterfall.

## TanStack Router

```tsx
const rootRoute = createRootRoute({ component: Layout })
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users/$userId',
  validateSearch: (search) => ({ tab: String(search.tab ?? 'profile') }),
  loader: ({ params }) => fetchUser(params.userId),
  component: UserDetail,
})

const router = createRouter({ routeTree: rootRoute.addChildren([userRoute]) })
createRoot(root).render(<RouterProvider router={router} />)
```

Params and search are typed end to end: `Route.useParams()` and `Route.useSearch()` give you concrete types, and invalid links fail at compile time.

## Wouter

```tsx
import { Route, Switch, Link } from 'wouter'

<Switch>
  <Route path="/" component={Home} />
  <Route path="/users/:userId">{(params) => <UserDetail userId={params.userId} />}</Route>
  <Route><NotFound /></Route>
</Switch>
```

Hook-first, a few kilobytes, no data layer — ideal for small apps and widgets.
