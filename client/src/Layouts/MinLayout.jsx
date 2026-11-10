
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router-dom";

export default function MinLayout() {
    return (
        <div className="main-layout">
            <Navbar />

            <div className="layout-body">
                <Sidebar />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
