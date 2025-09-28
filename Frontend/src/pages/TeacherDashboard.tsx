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
  User
} from 'lucide-react';

interface QuestionPaper {
  id: string;
  title: string;
  course: string;
  description: string;
  uploadedAt: string;
  studentUploads: number;
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
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover animate-scale-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                Total QPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{questionPapers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Question papers uploaded</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in" style={{animationDelay: '0.1s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-success" />
                Student Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {questionPapers.reduce((acc, qp) => acc + qp.studentUploads, 0)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total submissions received</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-warning" />
                Active Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {new Set(questionPapers.map(qp => qp.course)).size}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Courses with QPs</p>
            </CardContent>
          </Card>
        </div>

        {/* Upload QP Section */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Question Paper
                </CardTitle>
                <CardDescription>
                  Share new question papers with your students
                </CardDescription>
              </div>
              
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary hover:scale-105 transition-all duration-300 button-glow">
                    <Plus className="w-4 h-4 mr-2" />
                    New QP
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md animate-scale-in">
                  <DialogHeader>
                    <DialogTitle>Upload Question Paper</DialogTitle>
                    <DialogDescription>
                      Fill in the details and upload your question paper
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Mathematics Final Exam 2024"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm(prev => ({...prev, title: e.target.value}))}
                        required
                        className="transition-all duration-300 focus:scale-[1.02]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="course">Course</Label>
                      <Input
                        id="course"
                        placeholder="e.g., Mathematics"
                        value={uploadForm.course}
                        onChange={(e) => setUploadForm(prev => ({...prev, course: e.target.value}))}
                        required
                        className="transition-all duration-300 focus:scale-[1.02]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the question paper"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({...prev, description: e.target.value}))}
                        rows={3}
                        className="transition-all duration-300 focus:scale-[1.02]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="file">PDF File</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setUploadForm(prev => ({
                          ...prev, 
                          file: e.target.files?.[0] || null
                        }))}
                        required
                        className="transition-all duration-300 focus:scale-[1.02]"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsUploadOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex-1 bg-gradient-success button-glow"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin"></div>
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
        <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              My Question Papers
            </CardTitle>
            <CardDescription>
              Manage your uploaded question papers and view student submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questionPapers.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-float" />
                <h3 className="text-lg font-medium mb-2">No question papers yet</h3>
                <p className="text-muted-foreground">Upload your first question paper to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questionPapers.map((qp, index) => (
                  <div 
                    key={qp.id} 
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{qp.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium text-primary">{qp.course}</span> • 
                          Uploaded on {new Date(qp.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">{qp.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-success" />
                            <span className="font-medium">{qp.studentUploads}</span>
                            <span className="text-muted-foreground">submissions</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadQP(qp)}
                          className="hover:scale-110 transition-transform duration-300"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewSubmissions(qp)}
                          className="hover:scale-110 transition-transform duration-300"
                        >
                          <Eye className="w-4 h-4" />
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
    </DashboardLayout>
  );
}