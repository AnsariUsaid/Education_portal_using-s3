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
import { BookOpen, Download, Upload, FileText, Clock, CheckCircle } from 'lucide-react';

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

        setQuestionPapers(
          data.map((qp) => ({
            id: qp.id,
            title: qp.title,
            course: qp.course,
            description: qp.description,
            uploadedBy: qp.uploaded_by.toString(), // works now
            uploadedAt: new Date().toISOString(),
            hasSubmitted: false,
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
      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-hover animate-scale-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-primary" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{courses.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Available courses</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in" style={{animationDelay: '0.1s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-warning" />
                Total QPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">{questionPapers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Question papers available</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in" style={{animationDelay: '0.2s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-success" />
                Submitted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {questionPapers.filter(qp => qp.hasSubmitted).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Answers submitted</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-scale-in" style={{animationDelay: '0.3s'}}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-destructive" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gradient">
                {questionPapers.filter(qp => !qp.hasSubmitted).length}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Awaiting submission</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Selection */}
        <Card className="animate-fade-in-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Browse Courses
            </CardTitle>
            <CardDescription>
              Select a course to view available question papers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={selectedCourse === '' ? 'default' : 'outline'}
                onClick={() => setSelectedCourse('')}
                className="hover:scale-105 transition-all duration-300"
              >
                All Courses
              </Button>
              {courses.map((course) => (
                <Button
                  key={course.id}
                  variant={selectedCourse === course.name ? 'default' : 'outline'}
                  onClick={() => setSelectedCourse(course.name)}
                  className="hover:scale-105 transition-all duration-300"
                >
                  {course.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Question Papers List */}
        <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Question Papers
              {selectedCourse && (
                <span className="text-sm font-normal text-muted-foreground">
                  - {selectedCourse}
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Download question papers and upload your answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredQPs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-float" />
                <h3 className="text-lg font-medium mb-2">No question papers found</h3>
                <p className="text-muted-foreground">
                  {selectedCourse 
                    ? `No question papers available for ${selectedCourse}`
                    : 'No question papers available'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQPs.map((qp, index) => (
                  <div 
                    key={qp.id} 
                    className="border border-border rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-lg">{qp.title}</h4>
                          {qp.hasSubmitted && (
                            <CheckCircle className="w-5 h-5 text-success" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium text-primary">{qp.course}</span> • 
                          By {qp.uploadedBy} • 
                          {new Date(qp.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">{qp.description}</p>
                        
                        {qp.hasSubmitted && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Answer Submitted
                          </div>
                        )}
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
                        {!qp.hasSubmitted && (
                          <Button
                            size="sm"
                            onClick={() => openUploadDialog(qp.id)}
                            className="bg-gradient-success hover:scale-110 transition-transform duration-300"
                          >
                            <Upload className="w-4 h-4" />
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

        {/* Upload Answer Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-md animate-scale-in">
            <DialogHeader>
              <DialogTitle>Upload Answer</DialogTitle>
              <DialogDescription>
                Upload your answer sheet in PDF format
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUploadAnswer} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="answer-file">Answer Sheet (PDF)</Label>
                <Input
                  id="answer-file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setAnswerFile(e.target.files?.[0] || null)}
                  required
                  className="transition-all duration-300 focus:scale-[1.02]"
                />
                <p className="text-xs text-muted-foreground">
                  Please ensure your answer sheet is clear and readable
                </p>
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
                  disabled={isLoading || !answerFile}
                  className="flex-1 bg-gradient-success button-glow"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin"></div>
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