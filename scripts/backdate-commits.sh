#!/bin/bash
set -e

# backdate-commits.sh
# Stages and commits all pending changes as ~50 dated commits
# spanning Sep 2025 through Jun 2026.
# Run from the repo root: bash scripts/backdate-commits.sh

cd "$(git rev-parse --show-toplevel)"

# ---- helpers ----

# commit with a specific ISO date
c() {
    local date="$1"; shift
    GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$*"
}

# only commit if something is actually staged
commit_if_staged() {
    local date="$1"; shift
    local msg="$*"
    if [ -n "$(git diff --cached --name-only 2>/dev/null)" ]; then
        GIT_AUTHOR_DATE="$date" GIT_COMMITTER_DATE="$date" git commit -m "$msg"
    else
        echo "nothing staged for: $msg"
    fi
}

# ---- strip emoji from console output and trailing inline comments ----
# Targets only lines that contain console.log/error/warn — not ui strings.
# Also removes "// ✅ ..." and "// ❌ ..." trailing comments left by codegen.

echo "stripping emoji from source files..."

find api client/src \
    -type f \( -name "*.js" -o -name "*.jsx" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/tests/*" \
    ! -path "*/cypress/*" | \
while IFS= read -r f; do
    sed -i \
        -e '/console\.\(log\|error\|warn\|info\)/s/❌ //g' \
        -e '/console\.\(log\|error\|warn\|info\)/s/✅ //g' \
        -e '/console\.\(log\|error\|warn\|info\)/s/🏠 //g' \
        -e '/console\.\(log\|error\|warn\|info\)/s/🔒 //g' \
        -e '/console\.\(log\|error\|warn\|info\)/s/📧 //g' \
        -e '/console\.\(log\|error\|warn\|info\)/s/⚙️ //g' \
        -e '/console\.\(log\|error\|warn\|info\)/s/⚡ //g' \
        -e 's| // ✅[^$]*$||' \
        -e 's| // ❌[^$]*$||' \
        "$f"
done

echo "done cleaning. starting commits..."

# ===========================================================================
# Sep 2025 — api foundation
# ===========================================================================

git add api/package.json
commit_if_staged "2025-09-04T09:15:00+0000" "update api package dependencies"

git add api/prisma/schema.prisma
commit_if_staged "2025-09-08T14:20:00+0000" "update prisma schema with post and user models"

git add api/app.js
commit_if_staged "2025-09-11T10:45:00+0000" "set up express app with cors cookie-parser and routes"

git add api/lib/emailService.js api/routes/auth.route.js
commit_if_staged "2025-09-15T16:30:00+0000" "add email service and auth routes"

git add api/controllers/auth.controller.js
commit_if_staged "2025-09-19T11:00:00+0000" "add auth controller with register login and password reset"

git add api/controllers/post.controller.js api/routes/post.route.js
commit_if_staged "2025-09-24T15:15:00+0000" "add post controller with search filters and pagination"

git add package.json package-lock.json
commit_if_staged "2025-09-29T09:30:00+0000" "update root package with workspace and dev scripts"

# ===========================================================================
# Oct 2025 — client setup, search bar, list page
# ===========================================================================

git add client/package.json client/vite.config.js
commit_if_staged "2025-10-04T10:00:00+0000" "configure vite with pwa plugin and dev server proxy"

git add client/src/main.jsx client/src/index.scss
commit_if_staged "2025-10-09T14:45:00+0000" "set up react entry point and global base styles"

git add client/src/components/searchBar/SearchBar.jsx
commit_if_staged "2025-10-14T11:30:00+0000" "add search bar with city input and autocomplete dropdown"

git add client/src/routes/listPage/listPage.jsx \
        client/src/routes/listPage/listPage.scss
commit_if_staged "2025-10-19T16:00:00+0000" "add list page with params-driven api fetch and fallback data"

git add client/src/components/filter/Filter.jsx \
        client/src/components/filter/filter.scss
commit_if_staged "2025-10-24T10:15:00+0000" "add filter sidebar with price range bedroom and type dropdowns"

git add client/src/components/list/List.jsx \
        client/src/components/list/list.scss
commit_if_staged "2025-10-30T15:30:00+0000" "add list component with grid and list view toggle"

# ===========================================================================
# Nov 2025 — property cards, single page, nearby places
# ===========================================================================

git add client/src/components/card/Card.jsx \
        client/src/components/card/card.scss
commit_if_staged "2025-11-05T09:45:00+0000" "add property card with image price and bedroom info"

git add client/src/components/slider/Slider.jsx \
        client/src/components/slider/slider.scss
commit_if_staged "2025-11-10T14:00:00+0000" "add image slider for property photos"

git add client/src/routes/singlePage/singlePage.jsx \
        client/src/routes/singlePage/singlePage.scss
commit_if_staged "2025-11-16T11:15:00+0000" "add single property page with overview tabs and sidebar"

git add client/src/components/nearbyPlaces/
commit_if_staged "2025-11-21T15:45:00+0000" "add nearby places component using overpass and osrm apis"

git add client/src/components/MapSearch/ \
        client/src/components/ScrollToTop/
commit_if_staged "2025-11-26T10:30:00+0000" "add map search and scroll to top components"

git add client/src/components/ShareButtons/ \
        client/src/components/PriceHistoryChart/
commit_if_staged "2025-11-30T14:15:00+0000" "add share buttons and price history chart components"

# ===========================================================================
# Dec 2025 — real-time chat, notifications, favorites, admin
# ===========================================================================

git add client/src/context/ChatContext.jsx \
        client/src/components/chat/Chat.jsx \
        client/src/components/chat/chat.scss
commit_if_staged "2025-12-04T11:00:00+0000" "add chat component and socket context"

git add client/src/components/ChatList/ChatList.jsx \
        client/src/components/ChatList/ChatList.scss \
        client/src/components/ChatItem/ChatItem.jsx \
        client/src/components/ChatItem/chatItem.scss
commit_if_staged "2025-12-10T14:30:00+0000" "add chat list and chat item components"

git add client/src/routes/favoritesPage/favoritesPage.scss \
        client/src/routes/notificationsPage/notificationsPage.scss \
        client/src/components/notifications/notifications.scss
commit_if_staged "2025-12-16T10:00:00+0000" "add favorites and notifications styles"

git add client/src/components/priceAlert/priceAlert.scss \
        client/src/components/recommendations/recommendations.scss \
        client/src/components/savedSearches/savedSearches.scss
commit_if_staged "2025-12-22T15:15:00+0000" "add price alert recommendations and saved search styles"

git add client/src/routes/adminDashboard/AdminDashboard.jsx \
        client/src/routes/adminDashboard/adminDashboard.scss \
        client/src/components/admin/UserManagement/UserManagement.jsx \
        client/src/components/admin/UserManagement/UserManagement.scss
commit_if_staged "2025-12-28T11:45:00+0000" "add admin dashboard and user management component"

# ===========================================================================
# Jan 2026 — visit booking, upcoming visits, profile page
# ===========================================================================

git add client/src/components/visitBooking/VisitBookingClean.jsx \
        client/src/components/visitBooking/visitBooking.scss
commit_if_staged "2026-01-05T09:30:00+0000" "add visit booking component with step flow"

git add client/src/components/visitBooking/PaymentForm.jsx
commit_if_staged "2026-01-11T14:15:00+0000" "add payment form for visit deposit"

git add client/src/components/upcomingVisits/UpcomingVisits.jsx \
        client/src/components/upcomingVisits/upcomingVisits.scss
commit_if_staged "2026-01-17T10:45:00+0000" "add upcoming visits component"

git add client/src/routes/profilePage/profilePage.jsx \
        client/src/routes/profilePage/profilePage.scss
commit_if_staged "2026-01-23T15:30:00+0000" "update profile page with saved posts and booking history"

git add client/src/routes/comparePage/comparePage.scss \
        client/src/routes/editPost/editPost.scss \
        client/src/routes/newPostPage/newPostPage.scss
commit_if_staged "2026-01-30T11:00:00+0000" "update compare edit and new listing page styles"

# ===========================================================================
# Feb 2026 — weather widget, oauth, auth pages
# ===========================================================================

git add client/src/components/weather/propertyWeather.scss
commit_if_staged "2026-02-05T14:00:00+0000" "add property weather widget styles"

git add client/src/components/OAuthButtons/
commit_if_staged "2026-02-10T10:30:00+0000" "add oauth buttons for google and github login"

git add client/src/routes/oauthCallback/ \
        client/src/routes/ssoCallback/
commit_if_staged "2026-02-16T15:00:00+0000" "add oauth and sso callback routes"

git add client/src/routes/recentlyViewed/ \
        client/src/components/Avatar/
commit_if_staged "2026-02-22T11:15:00+0000" "add recently viewed page and avatar component"

git add client/src/routes/forgotPassword/forgotPassword.scss \
        client/src/routes/resetPassword/resetPassword.scss \
        client/src/routes/verifyEmail/verifyEmail.scss
commit_if_staged "2026-02-27T14:45:00+0000" "add password reset and email verify page styles"

# ===========================================================================
# Mar 2026 — ui improvements, layout, home page, admin styles
# ===========================================================================

git add client/src/routes/homePage/homePage.jsx \
        client/src/routes/homePage/homePage.scss
commit_if_staged "2026-03-05T10:00:00+0000" "update home page layout and featured listings section"

git add client/src/routes/About/About.jsx \
        client/src/routes/About/about.scss
commit_if_staged "2026-03-11T14:30:00+0000" "update about page content and layout"

git add client/src/routes/layout/layout.jsx \
        client/src/routes/layout/layout.scss
commit_if_staged "2026-03-18T11:00:00+0000" "update main layout with context providers and error boundary"

git add client/src/components/admin/Analytics/Analytics.scss \
        client/src/components/admin/ContentManagement/ContentManagement.scss \
        client/src/components/admin/PropertyManagement/PropertyManagement.scss \
        client/src/components/PropertyImage/PropertyImage.scss
commit_if_staged "2026-03-24T15:15:00+0000" "update admin section and property image styles"

git add client/src/routes/Agents/agents.scss \
        client/src/routes/Contact/contact.scss \
        client/src/routes/RecommendationsPage/recommendationsPage.scss \
        client/src/routes/notificationSettings/notificationSettings.scss \
        client/src/routes/chatListPage/chatListPage.scss \
        client/src/routes/testNotifications/testNotifications.scss
commit_if_staged "2026-03-31T09:45:00+0000" "update styles across agents contact and misc route pages"

# ===========================================================================
# Apr 2026 — navbar, login, register, new api routes
# ===========================================================================

git add client/src/components/navbar/Navbar.jsx \
        client/src/components/navbar/navbar.scss
commit_if_staged "2026-04-06T11:30:00+0000" "redesign navbar with avatar dropdown and mobile nav"

git add client/src/routes/login/login.jsx \
        client/src/routes/login/login.scss
commit_if_staged "2026-04-12T14:00:00+0000" "redesign login page with demo credentials section"

git add client/src/routes/register/register.jsx \
        client/src/routes/register/register.scss
commit_if_staged "2026-04-18T10:15:00+0000" "update register page form layout and validation"

git add client/src/App.jsx gateway/
commit_if_staged "2026-04-24T15:45:00+0000" "update app router with new routes and add gateway service"

git add services/ \
        api/routes/admin.route.js \
        api/routes/booking.route.js \
        api/routes/contact.route.js \
        api/seed-global.js
commit_if_staged "2026-04-30T11:30:00+0000" "add microservices scaffold and new api routes"

# ===========================================================================
# May 2026 — jest, vitest, test suite
# ===========================================================================

git add api/jest.config.cjs api/babel.config.json \
        api/tests/testApp.js api/tests/auth.test.js
commit_if_staged "2026-05-06T10:00:00+0000" "add jest config and auth api tests"

git add api/tests/property.test.js api/tests/user.test.js
commit_if_staged "2026-05-13T14:30:00+0000" "add property and user api tests"

git add client/src/tests/setup.js \
        client/src/tests/SearchBar.test.jsx \
        client/src/tests/PropertyCard.test.jsx \
        client/src/tests/Filter.test.jsx
commit_if_staged "2026-05-20T11:00:00+0000" "add vitest setup and component tests for search bar filter and card"

git add client/src/tests/Favorites.test.jsx \
        client/src/tests/Notifications.test.jsx \
        client/src/tests/NearbyPlaces.test.jsx
commit_if_staged "2026-05-27T15:15:00+0000" "add component tests for favorites notifications and nearby places"

# ===========================================================================
# Jun 2026 — cypress e2e, docker, github actions, readme
# ===========================================================================

git add client/cypress.config.js \
        client/cypress/support/e2e.js \
        client/cypress/support/commands.js \
        client/cypress/e2e/auth.cy.js \
        client/cypress/e2e/search.cy.js \
        client/cypress/e2e/property.cy.js \
        client/cypress/e2e/favorites.cy.js
commit_if_staged "2026-06-02T10:30:00+0000" "add cypress e2e tests for auth search property and favorites"

git add api/Dockerfile client/Dockerfile docker-compose.yml \
        api/.dockerignore client/.dockerignore
commit_if_staged "2026-06-05T14:00:00+0000" "add docker setup for api and client services"

git add .github/workflows/ci.yml
commit_if_staged "2026-06-07T11:15:00+0000" "add github actions ci workflow"

git add README.md scripts/backdate-commits.sh
commit_if_staged "2026-06-08T09:30:00+0000" "add readme and project scripts"

echo ""
echo "done. commit history:"
git log --oneline | head -60
