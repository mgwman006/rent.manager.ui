import { Outlet, useOutletContext } from "react-router-dom";

export default function LeasesDashboard() {
  const { rentalProfileId } = useOutletContext<{ rentalProfileId: number }>();

  return (
    <div>
      <Outlet context={{ rentalProfileId }} />
    </div>
  );
}
