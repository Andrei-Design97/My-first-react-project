import React from "react";
import styles from "./styles/Dashboard.module.css";

const Dashboard = ({ user }) => {
    return (
        <div className={styles.container}>
            <main className={styles.mainContent}>
                <div className={styles.dashboardContent}>
                    <h1>Welcome to your Dashboard</h1>
                    <p>Select an option from the menu above.</p>
                    {user?.isAdmin && <p>You have admin privileges.</p>}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
