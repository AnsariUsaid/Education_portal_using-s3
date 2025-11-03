// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
 import DashboardLayout from '@/components/layout/DashboardLayout';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { useToast } from '@/hooks/use-toast';
// import { 
//   Upload, 
//   FileText, 
//   Download, 
//   Eye, 
//   Users, 
//   BookOpen, 
//   Plus,
//   Trash2
// } from 'lucide-react';

// interface QuestionPaper {
//   id: string;
//   title: string;
//   course: string;
//   description: string;
//   uploadedAt: string;
//   studentUploads: number;
// }

// interface StudentUpload {
//   id: string;
//   studentName: string;
//   uploadedAt: string;
//   qpId: string;
// }
// export default function TeacherDashboard() {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [isUploadOpen, setIsUploadOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
//   const [studentUploads, setStudentUploads] = useState<StudentUpload[]>([]);
//   const [selectedQP, setSelectedQP] = useState<QuestionPaper | null>(null);

//   const [uploadForm, setUploadForm] = useState({
//     title: '',
//     course: '',
//     description: '',
//     file: null as File | null,
//   });

//   useEffect(() => {
//     const role = localStorage.getItem('role');
//     if (role !== 'teacher') {
//       navigate('/login');
//     } else {
//       fetchUploadedList();
//     }
//   }, [navigate]);

//   // ✅ Fetch teacher’s uploaded QPs
//   const fetchUploadedList = async () => {
//     const token = localStorage.getItem('token');
//     try {
//       const res = await fetch('http://127.0.0.1:8000/teacher/uploaded-list', {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error('Failed to fetch uploaded list');
//       const data = await res.json();
//       setQuestionPapers(data);
//     } catch (error) {
//       toast({
//         title: 'Error fetching question papers',
//         description: 'Please try again later',
//         variant: 'destructive',
//       });
//     }
//   };

//   // ✅ Upload QP
//   const handleUploadSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const token = localStorage.getItem('token');
//       const formData = new FormData();
//       formData.append('title', uploadForm.title);
//       formData.append('course', uploadForm.course);
//       formData.append('description', uploadForm.description);
//       if (uploadForm.file) {
//         formData.append('file', uploadForm.file);
//       }

//       const res = await fetch('http://127.0.0.1:8000/teacher/upload/', {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       if (!res.ok) throw new Error('Upload failed');
//       const data = await res.json();

//       toast({ title: 'Success!', description: data.msg });
//       setUploadForm({ title: '', course: '', description: '', file: null });
//       setIsUploadOpen(false);
//       fetchUploadedList();
//     } catch (error) {
//       toast({
//         title: 'Upload failed',
//         description: 'Please try again later',
//         variant: 'destructive',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ✅ Download QP
//   const handleDownloadQP = async (qp: QuestionPaper) => {
//     const token = localStorage.getItem('token');
//     const res = await fetch(
//       `http://127.0.0.1:8000/teacher/download/${qp.id}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (!res.ok) {
//       toast({ title: 'Download failed', variant: 'destructive' });
//       return;
//     }

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${qp.title}.pdf`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   };

//   // ✅ View submissions for a QP
//   const handleViewSubmissions = async (qp: QuestionPaper) => {
//     setSelectedQP(qp);
//     const token = localStorage.getItem('token');
//     const res = await fetch(
//       `http://127.0.0.1:8000/teacher/student-uploads/${qp.id}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (!res.ok) {
//       toast({ title: 'Failed to load submissions', variant: 'destructive' });
//       return;
//     }

//     const uploads: StudentUpload[] = await res.json();
//     setStudentUploads(uploads);
//   };

//   // ✅ Download student submission
//   const handleDownloadStudentUpload = async (answerId: number) => {
//     const token = localStorage.getItem('token');
//     const res = await fetch(
//       `http://127.0.0.1:8000/teacher/download-student-upload/${answerId}`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     if (!res.ok) {
//       toast({ title: 'Download failed', variant: 'destructive' });
//       return;
//     }

//     const blob = await res.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `student_upload_${answerId}.pdf`;
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   };
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Users, 
  BookOpen, 
  Plus,
  ArrowLeft,
  Calendar,
  User,
  Activity,
  TrendingUp
} from 'lucide-react';

interface QuestionPaper {
  id: string;
  title: string;
  course: string;
  description: string;
  uploadedAt: string;
  studentUploads?: number; // Make optional with fallback
}

interface StudentUpload {
  id: string;
  answer_id: number;
  student_name: string;
  answered_by: number;
  uploaded_at: string;
  s3_key: string;
  qp_id: string;
}

export default function TeacherDashboard() {
  // Mock toast function - replace with your actual toast implementation
  const toast = ({ title, description, variant }: any) => {
    console.log(`${variant ? `[${variant}] ` : ''}${title}: ${description}`);
    alert(`${title}: ${description}`);
  };
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [studentUploads, setStudentUploads] = useState<StudentUpload[]>([]);
  const [selectedQP, setSelectedQP] = useState<QuestionPaper | null>(null);
  const [viewingSubmissions, setViewingSubmissions] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    title: '',
    course: '',
    description: '',
    file: null as File | null,
  });

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'teacher') {
      // navigate('/login');
      console.log('Not a teacher - redirect to login');
    } else {
      fetchUploadedList();
    }
  }, []);

  // ✅ Fetch teacher's uploaded QPs
  const fetchUploadedList = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:8000/teacher/uploaded-list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch uploaded list');
      const data = await res.json();
      
      console.log('Fetched question papers:', data); // Debug log
      setQuestionPapers(data);
    } catch (error) {
      toast({
        title: 'Error fetching question papers',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  // ✅ Upload QP
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('course', uploadForm.course);
      formData.append('description', uploadForm.description);
      if (uploadForm.file) {
        formData.append('file', uploadForm.file);
      }

      const res = await fetch('http://127.0.0.1:8000/teacher/upload/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();

      toast({ title: 'Success!', description: data.msg });
      setUploadForm({ title: '', course: '', description: '', file: null });
      setIsUploadOpen(false);
      fetchUploadedList();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Download QP
  const handleDownloadQP = async (qp: QuestionPaper) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/teacher/download/${qp.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        toast({ title: 'Download failed', variant: 'destructive' });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${qp.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  // ✅ View submissions for a QP
  const handleViewSubmissions = async (qp: QuestionPaper) => {
    setIsLoading(true);
    setSelectedQP(qp);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/teacher/student-uploads/${qp.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to load submissions');
      }

      const uploads: StudentUpload[] = await res.json();
      setStudentUploads(uploads);
      setViewingSubmissions(true);
    } catch (error) {
      toast({ 
        title: 'Failed to load submissions', 
        description: 'Please try again later',
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Download student submission
  const handleDownloadStudentUpload = async (upload: StudentUpload) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/teacher/download-student-upload/${upload.answer_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        toast({ title: 'Download failed', variant: 'destructive' });
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${upload.student_name}_${selectedQP?.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  // Go back to main view
  const handleBackToMain = () => {
    setViewingSubmissions(false);
    setSelectedQP(null);
    setStudentUploads([]);
  };

  return (
    <DashboardLayout title="Teacher Dashboard" role="teacher">
      {!viewingSubmissions ? (
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {localStorage.getItem('username')}! 👋</h2>
            <p className="text-blue-100">Manage your question papers and track student submissions.</p>
          </div>

          {/* Statistics Cards - More Compact */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{questionPapers.length}</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Total QPs</p>
                <p className="text-xs text-gray-500">Uploaded</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {questionPapers.reduce((acc, qp) => acc + (qp.studentUploads || 0), 0)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">Submissions</p>
                <p className="text-xs text-gray-500">Received</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {new Set(questionPapers.map(qp => qp.course)).size}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700">Courses</p>
                <p className="text-xs text-gray-500">Active</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Button */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Upload Question Paper
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Share new question papers with your students
                      </CardDescription>
                    </div>
                    
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                          <Plus className="w-4 h-4 mr-2" />
                          New QP
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-bold text-gray-900">Upload Question Paper</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Fill in the details and upload your question paper
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Title</Label>
                            <Input
                              id="title"
                              placeholder="e.g., Mathematics Final Exam 2024"
                              value={uploadForm.title}
                              onChange={(e) => setUploadForm(prev => ({...prev, title: e.target.value}))}
                              required
                              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="course" className="text-sm font-semibold text-gray-700">Course</Label>
                            <Input
                              id="course"
                              placeholder="e.g., Mathematics"
                              value={uploadForm.course}
                              onChange={(e) => setUploadForm(prev => ({...prev, course: e.target.value}))}
                              required
                              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Description</Label>
                            <Textarea
                              id="description"
                              placeholder="Brief description of the question paper"
                              value={uploadForm.description}
                              onChange={(e) => setUploadForm(prev => ({...prev, description: e.target.value}))}
                              rows={3}
                              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="file" className="text-sm font-semibold text-gray-700">PDF File</Label>
                            <Input
                              id="file"
                              type="file"
                              accept=".pdf"
                              onChange={(e) => setUploadForm(prev => ({
                                ...prev, 
                                file: e.target.files?.[0] || null
                              }))}
                              required
                              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            />
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
                              disabled={isLoading}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                            >
                              {isLoading ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  Uploading...
                                </div>
                              ) : (
                                'Upload'
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
              </Card>

              {/* Uploaded QPs List */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                      <FileText className="w-5 h-5 text-blue-600" />
                      My Question Papers
                    </CardTitle>
                    <span className="text-sm text-gray-500">{questionPapers.length} papers</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {questionPapers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">No question papers yet</h3>
                      <p className="text-xs text-gray-600">Upload your first question paper to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {questionPapers.map((qp) => (
                        <div 
                          key={qp.id} 
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white hover:border-blue-200"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base text-gray-900 truncate mb-2">{qp.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-2">
                                <Badge variant="outline" className="border-blue-200 text-blue-700">
                                  {qp.course}
                                </Badge>
                                <span className="text-gray-400">•</span>
                                <span>{new Date(qp.uploadedAt).toLocaleDateString()}</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{qp.description}</p>
                              
                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md">
                                  <Users className="w-3 h-3" />
                                  <span className="font-medium">{qp.studentUploads || 0}</span>
                                  <span>submissions</span>
                                </div>
                              </div>
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
                              <Button
                                size="sm"
                                onClick={() => handleViewSubmissions(qp)}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs h-8"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View ({qp.studentUploads})
                              </Button>
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
              {/* Recent Uploads */}
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base font-bold text-gray-900">
                    <Activity className="w-4 h-4 text-blue-600" />
                    Recent Uploads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {questionPapers.slice(0, 4).map((qp, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{qp.title}</p>
                          <p className="text-xs text-gray-500">
                            {qp.course} • {qp.studentUploads || 0} submissions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Overview Stats */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-xl font-bold">{questionPapers.length}</p>
                        <p className="text-xs text-blue-100">Total Papers</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <p className="text-xl font-bold">
                          {questionPapers.reduce((acc, qp) => acc + (qp.studentUploads || 0), 0)}
                        </p>
                        <p className="text-xs text-blue-100">Submissions</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-xs text-blue-100 mb-1">Average per Paper</p>
                      <p className="text-2xl font-bold">
                        {questionPapers.length > 0 
                          ? Math.round(questionPapers.reduce((acc, qp) => acc + (qp.studentUploads || 0), 0) / questionPapers.length)
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        // Submissions View
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={handleBackToMain}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-0 shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900">
                Submissions for: {selectedQP?.title}
              </CardTitle>
              <CardDescription className="text-gray-600">
                Course: {selectedQP?.course} • {studentUploads.length} submission(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {studentUploads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">No submissions yet</h3>
                  <p className="text-xs text-gray-600">Students haven't submitted answers for this paper</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentUploads.map((upload) => (
                    <div
                      key={upload.answer_id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all hover:border-blue-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{upload.student_name || 'Unknown Student'}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {upload.uploaded_at ? new Date(upload.uploaded_at).toLocaleString() : 'Date not available'}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadStudentUpload(upload)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}