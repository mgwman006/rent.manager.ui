import Home from "./components/Home";
import HomePage from "./components/HomePage";
import RentalProfilePage from "./components/rentalprofile/RentalProfilePage";
import LeaseDashboard from "./components/lease/LeasesDashboard";
import LeaseList from "./components/lease/LeaseList";
import LeaseDetails from "./components/lease/LeaseDetails";
import PropertiesDashboard from "./components/properties/PropertiesDashboard";
import Dashboard from "./components/rentalprofile/Dashbord";
import InvitationDetails from "./components/invitation/InvitationDetails";
const routes = [
  {
    path: "/",
    Component: Home,
    children: [
      {
        path: "",
        Component: HomePage,
      },
      {
        path: "rental-profile",
        Component: RentalProfilePage,
        children: [
          {
            path: "",
            Component: Dashboard
          },
          {
            path: "leases",
            Component: LeaseDashboard,
            children: [
              {
                path:"",
                Component:LeaseList
              },
              {
                path:"leases/:leaseIdParam",
                Component:LeaseDetails
              }
            ]
          },
          {
            path: "invitations/:invitationToken",
            Component: InvitationDetails,
          },
          {
            path: "properties",
            Component: PropertiesDashboard,
          }
        ]
      }
    ]
  }
];

export default routes;
