import { useSignIn } from "@clerk/nextjs";

const DashboardPage = async () => {
    // const response = await fetch("/../../api/send");

    // const data = await response.json();

    // console.log(`DATA: ${data}`);
    return (
        <>
            <h1 className="text-2xl font-bold mb-5">Dashboard</h1>
            <p className="mb-5">Welcome to the Dashboard!</p>
        </>
    );
};

export default DashboardPage;
