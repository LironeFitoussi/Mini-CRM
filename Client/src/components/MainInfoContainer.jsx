import MainInfoCard from "./Atoms/MainInfoCard";

const MainInfoContainer = () => {
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MainInfoCard title="totalDonators" type="info" />
        <MainInfoCard title="New Signups" type="success" />
        <MainInfoCard title="Active Sessions" type="warning" />
        <MainInfoCard title="Pending Tasks" type="error" />
      </div>
    </>
  );
};

export default MainInfoContainer;
