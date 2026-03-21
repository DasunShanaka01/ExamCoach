import StudentNavbar from '../components/StudentNavbar';

const StudentLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50">
            <StudentNavbar />
            <main className="p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;
