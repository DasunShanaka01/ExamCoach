import StudentNavbar from '../components/StudentNavbar';
import Footer from '../components/Footer';
import AILearningLab from '../components/AILearningLab';
import { Sparkles } from 'lucide-react';

const AILearningLabPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <StudentNavbar />
            <div className="max-w-screen-2xl mx-auto px-8 py-12 flex-1">
                <div className="flex items-center gap-3 text-blue-600 mb-10">
                    <div className="h-10 w-10 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 flex items-center gap-2">AI Learning Lab</h1>
                        <p className="text-sm text-slate-500">Use the power of AI to summarize your study materials and enhance your learning.</p>
                    </div>
                </div>

                <AILearningLab />
            </div>
            <Footer />
        </div>
    );
};

export default AILearningLabPage;
