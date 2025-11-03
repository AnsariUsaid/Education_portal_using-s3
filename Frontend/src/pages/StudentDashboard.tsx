import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Upload, FileText, Clock, CheckCircle, TrendingUp, Calendar, Activity, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  name: string;
}

interface QuestionPaper {
  id: number;
  title: string;
  course: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  hasSubmitted: boolean;
}

interface QuestionPaperFromBackend {
  id: number;
  title: string;
  course: string;
  description: string;
  uploaded_by: number;
  s3_key: string;
  hasSubmitted?: boolean;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadingQpId, setUploadingQpId] = useState<number | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted'>('all');

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://127.0.0.1:8000/student/courses', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch courses');

        const data: { id: string; name: string }[] = await res.json();
        setCourses(data);
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Could not fetch courses',
          variant: 'destructive',
        });
      }
    };

    fetchCourses();
  }, [toast]);

  // Fetch question papers whenever a course is selected
  useEffect(() => {

    const fetchQPs = async () => {
      try {
        const token = localStorage.getItem('token');
        const courseParam = selectedCourse || 'all';
        const res = await fetch(`http://127.0.0.1:8000/student/questions/${courseParam}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch question papers');

        const data: QuestionPaperFromBackend[] = await res.json();

        console.log('Fetched question papers:', data); // Debug log
        
        setQuestionPapers(
          data.map((qp) => ({
            id: qp.id,
            title: qp.title,
            course: qp.course,
            description: qp.description,
            uploadedBy: qp.uploaded_by.toString(),
            uploadedAt: new Date().toISOString(),
            hasSubmitted: qp.hasSubmitted || false, // Use backend value
          }))
        );
      } catch (err) {
        toast({
          title: 'Error',
          description: err instanceof Error ? err.message : 'Could not fetch QPs',
          variant: 'destructive',
        });
      }
    };

    fetchQPs();
  }, [selectedCourse, toast]);

  // Redirect if not a student
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'student') navigate('/login');
  }, [navigate]);

  const filteredQPs = selectedCourse
    ? questionPapers.filter((qp) => qp.course.toLowerCase() === selectedCourse.toLowerCase())
    : questionPapers;

  // Apply status filter
  const statusFilteredQPs = filteredQPs.filter((qp) => {
    if (filterStatus === 'pending') return !qp.hasSubmitted;
    if (filterStatus === 'submitted') return qp.hasSubmitted;
    return true; // 'all'
  });

  // Handler for showing all papers
  const handleViewAllPapers = () => {
    setSelectedCourse('');
    setFilterStatus('all');
  };

  // Handler for showing only submitted papers
  const handleViewSubmitted = () => {
    setSelectedCourse('');
    setFilterStatus('submitted');
  };

  // Handler for showing only pending papers
  const handleViewPending = () => {
    setSelectedCourse('');
    setFilterStatus('pending');
  };

  // Download question paper
  const handleDownloadQP = async (qp: QuestionPaper) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://127.0.0.1:8000/student/download/${qp.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Download failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qp.title}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Downloaded', description: `${qp.title} has been downloaded` });
    } catch (err) {
      toast({
        title: 'Download failed',
        description: err instanceof Error ? err.message : 'Could not download the file',
        variant: 'destructive',
      });
    }
  };

  // Upload answer
  const handleUploadAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerFile || !uploadingQpId) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', answerFile);

      const res = await fetch(`http://127.0.0.1:8000/student/upload_answer/${uploadingQpId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      toast({ title: 'Uploaded', description: 'Your answer has been submitted' });
      setQuestionPapers(prev =>
        prev.map(qp =>
        qp.id === uploadingQpId ? { ...qp, hasSubmitted: true } : qp
        )
      );
      setIsUploadOpen(false);
      setAnswerFile(null);
      setUploadingQpId(null);
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openUploadDialog = (qpId: number) => {
    setUploadingQpId(qpId);
    setIsUploadOpen(true);
  };

  return (
    <DashboardLayout title="Student Dashboard" role="student">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {localStorage.getItem('username')}! 👋</h2>
          <p className="text-blue-100">Track your progress and manage your submissions all in one place.</p>
        </div>

        {/* Statistics Cards - More Compact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-blue-600">{courses.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Courses</p>
              <p className="text-xs text-gray-500">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{questionPapers.length}</span>
              </div>
              <p className="text-sm font-medium text-gray-700">Total QPs</p>
              <p className="text-xs text-gray-500">Available</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {questionPapers.filter(qp => qp.hasSubmitted).length}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Submitted</p>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {questionPapers.filter(qp => !qp.hasSubmitted).length}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700">Pending</p>
              <p className="text-xs text-gray-500">Due soon</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Selection */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Browse Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedCourse === '' ? 'default' : 'outline'}
                    onClick={() => setSelectedCourse('')}
                    className={selectedCourse === '' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
                      : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'}
                  >
                    All Courses
                  </Button>
                  {courses.map((course) => (
                    <Button
                      key={course.id}
                      size="sm"
                      variant={selectedCourse === course.name ? 'default' : 'outline'}
                      onClick={() => setSelectedCourse(course.name)}
                      className={selectedCourse === course.name 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700' 
                        : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'}
                    >
                      {course.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Question Papers List */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Question Papers
                    {selectedCourse && (
                      <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                        {selectedCourse}
                      </Badge>
                    )}
                    {filterStatus !== 'all' && (
                      <Badge variant="secondary" className="ml-2 bg-purple-100 text-purple-700">
                        {filterStatus === 'pending' ? 'Pending Only' : 'Submitted Only'}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{statusFilteredQPs.length} papers</span>
                    {filterStatus !== 'all' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleViewAllPapers}
                        className="text-xs h-7"
                      >
                        Clear Filter
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {statusFilteredQPs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">No question papers found</h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {filterStatus === 'pending' && 'No pending submissions'}
                      {filterStatus === 'submitted' && 'No submitted papers yet'}
                      {filterStatus === 'all' && selectedCourse && `No papers available for ${selectedCourse}`}
                      {filterStatus === 'all' && !selectedCourse && 'No papers available'}
                    </p>
                    {filterStatus !== 'all' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleViewAllPapers}
                        className="text-xs"
                      >
                        View All Papers
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {statusFilteredQPs.map((qp) => (
                      <div 
                        key={qp.id} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white hover:border-blue-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-base text-gray-900 truncate">{qp.title}</h4>
                              {qp.hasSubmitted && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Done
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                              <Badge variant="outline" className="border-blue-200 text-blue-700">
                                {qp.course}
                              </Badge>
                              <span className="text-gray-400">•</span>
                              <span>By {qp.uploadedBy}</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">{qp.description}</p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadQP(qp)}
                              className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 text-xs h-8"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                            {!qp.hasSubmitted && (
                              <Button
                                size="sm"
                                onClick={() => openUploadDialog(qp.id)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs h-8"
                              >
                                <Upload className="w-3 h-3 mr-1" />
                                Submit
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                  <Activity className="w-4 h-4 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questionPapers.slice(0, 4).map((qp, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        qp.hasSubmitted ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {qp.hasSubmitted ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">{qp.title}</p>
                        <p className="text-xs text-gray-500">
                          {qp.hasSubmitted ? 'Submitted' : 'Pending'} • {qp.course}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Overview */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Completion Rate</span>
                      <span className="font-semibold">
                        {questionPapers.length > 0 
                          ? Math.round((questionPapers.filter(qp => qp.hasSubmitted).length / questionPapers.length) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-blue-400/30 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500"
                        style={{ 
                          width: questionPapers.length > 0 
                            ? `${(questionPapers.filter(qp => qp.hasSubmitted).length / questionPapers.length) * 100}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-xl font-bold">{questionPapers.filter(qp => qp.hasSubmitted).length}</p>
                      <p className="text-xs text-blue-100">Completed</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-xl font-bold">{questionPapers.filter(qp => !qp.hasSubmitted).length}</p>
                      <p className="text-xs text-blue-100">Remaining</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Upload Answer Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Upload Answer</DialogTitle>
              <DialogDescription className="text-gray-600">
                Upload your answer sheet in PDF format
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUploadAnswer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer-file" className="text-sm font-semibold text-gray-700">Answer Sheet (PDF)</Label>
                <Input
                  id="answer-file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <p className="text-xs text-gray-500">
                  Please ensure your answer sheet is clear and readable
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsUploadOpen(false)}
                  className="flex-1 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !answerFile}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Upload Answer'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}