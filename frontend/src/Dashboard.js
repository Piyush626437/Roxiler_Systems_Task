import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { getCombinedData, getTransactions } from './ApiService';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

// Register necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [month, setMonth] = useState('March');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    const fetchCombinedData = useCallback(async () => {
        setLoading(true);
        try {
            const combinedData = await getCombinedData(month);
            setData(combinedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    }, [month]);

    const fetchTransactions = useCallback(async () => {
        try {
            const transactionsData = await getTransactions(month, search, page, perPage);
            setTransactions(transactionsData.transactions || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        }
    }, [month, search, page, perPage]);

    useEffect(() => {
        fetchCombinedData();
        fetchTransactions();
    }, [fetchCombinedData, fetchTransactions]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to the first page when a new search is applied
    };

    const handleNextPage = () => {
        setPage((prev) => prev + 1);
    };

    const handlePreviousPage = () => {
        setPage((prev) => Math.max(prev - 1, 1));
    };

    const renderBarChart = () => {
        if (data && data.barChart) {
            const labels = Object.keys(data.barChart);
            const values = Object.values(data.barChart);

            return (
                <Bar
                    data={{
                        labels,
                        datasets: [
                            {
                                label: 'Number of Items',
                                data: values,
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: `Price Range Distribution for ${month}`,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            );
        }
        return null;
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Product Dashboard</h1>
            <div className="month-selector">
                <label>Select Month: </label>
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            <div className="search">
                <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Date of Sale</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(transactions) && transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <tr key={transaction.id}>
                                <td>{transaction.title}</td>
                                <td>{transaction.description}</td>
                                <td>${transaction.price}</td>
                                <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No transactions found for the selected month.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="pagination">
                <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
                <span>Page {page}</span>
                <button onClick={handleNextPage}>Next</button>
            </div>

            {data && (
                <div className="statistics">
                    <h2>Statistics for {month}</h2>
                    <p>Total Sale Amount: ${data.statistics.totalSaleAmount}</p>
                    <p>Total Sold Items: {data.statistics.totalSoldItems}</p>
                    <p>Total Not Sold Items: {data.statistics.totalNotSoldItems}</p>
                </div>
            )}

            <h2>Transactions Bar Chart</h2>
            {renderBarChart()}

            <h2>Pie Chart</h2>
            <ul>
                {data && Object.entries(data.pieChart).map(([category, count]) => (
                    <li key={category}>{category}: {count} items</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;
