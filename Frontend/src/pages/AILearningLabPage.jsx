import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';
import AILearningLab from '../components/AILearningLab';

const AILearningLabPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <StudentNavbar />
            <div className="max-w-7xl mx-auto px-8 py-12 flex-1">
                <header className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        AI Learning Lab
                    </h1>
                    <p className="text-gray-600">
                        Use the power of AI to summarize your study materials and enhance your learning.
                    </p>
                </header>

                <AILearningLab />
            </div>
            <Footer />
        </div>
    );
};

export default AILearningLabPage;
