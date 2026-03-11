export default function Topbar({ active }) {
  return (
    <div className="topbar">
      <div className="d-flex align-items-center justify-content-between h-100 px-4">

        <div className="topbar-title text-capitalize">
          {active}
        </div>

        <div className="status-pill">
          <span className="status-dot"></span>
        </div>

      </div>
    </div>
  );
}