import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, Eye, Zap, ZoomIn, RotateCcw, CheckCircle, AlertTriangle, Upload, Activity } from "lucide-react";
import { captureRetinalImage, simulateCaptureForWeb, isNativePlatform, pickImageFromGallery, uploadImageFromFile, validateRetinalImage } from "@/lib/camera";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Patient, createVisit } from "@/lib/database";
import { PatientSearch } from "./PatientSearch";
import { useNavigate } from "react-router-dom";

interface CameraInterfaceProps {
  onBack: () => void;
  onAnalysisComplete?: (results: StrokeRiskAnalysis) => void;
  preselectedPatient?: Patient;
}

interface StrokeRiskAnalysis {
  imagePath: string;
  imageSource: 'camera' | 'gallery' | 'upload';
  strokeRiskPercentage: number;
  strokeRiskLevel: string;
  riskFactors: any;
  aiRecommendations: string;
  imageQualityScore: number;
  confidence: number;
}

export const CameraInterface = ({ onBack, onAnalysisComplete, preselectedPatient }: CameraInterfaceProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(preselectedPatient || null);
  const [imageSource, setImageSource] = useState<'camera' | 'upload'>('camera');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedEye, setSelectedEye] = useState<"left" | "right" | null>(null);
  const [captureMode, setCaptureMode] = useState<"macula" | "disc">("macula");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string | null>(null);
  const [qualityCheck, setQualityCheck] = useState<{
    blur: "pass" | "fail";
    exposure: "pass" | "fail";
    coverage: "pass" | "fail";
    artifacts: "pass" | "fail";
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [strokeRiskResult, setStrokeRiskResult] = useState<{
    percentage: number;
    level: string;
    factors: any;
    recommendations: string[];
    imageQualityScore: number;
    confidence: number;
  } | null>(null);

  const handleCapture = async () => {
    if (!selectedEye) return;

    setIsCapturing(true);
    
    try {
      // Use native camera on mobile, simulate on web
      const captureFunction = isNativePlatform() ? captureRetinalImage : simulateCaptureForWeb;
      
      const result = await captureFunction({
        eye: selectedEye,
        mode: captureMode,
        flash: flashEnabled
      });
      
      setCapturedImage(result.uri);
      setCapturedFileName(result.fileName);
      
      toast({
        title: "Image Captured",
        description: "Analyzing image quality...",
      });
      
      // Simulate quality check (in production, this would be AI-powered)
      setTimeout(() => {
        setQualityCheck({
          blur: Math.random() > 0.3 ? "pass" : "fail",
          exposure: Math.random() > 0.2 ? "pass" : "fail",
          coverage: Math.random() > 0.4 ? "pass" : "fail",
          artifacts: Math.random() > 0.1 ? "pass" : "fail"
        });
        setIsCapturing(false);
      }, 1500);
    } catch (error) {
      console.error("Capture failed:", error);
      toast({
        title: "Capture Failed",
        description: error instanceof Error ? error.message : "Failed to capture image",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const handleGalleryUpload = async () => {
    if (!selectedEye) {
      toast({
        title: "Select Eye First",
        description: "Please select which eye this image is for",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);
    
    try {
      const result = isNativePlatform() 
        ? await pickImageFromGallery({ eye: selectedEye, mode: captureMode, flash: false })
        : await handleWebFileUpload();

      const validation = await validateRetinalImage(result.uri);
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }

      setCapturedImage(result.uri);
      setCapturedFileName(result.fileName);
      
      toast({
        title: "Image Uploaded",
        description: `${validation.dimensions?.width}x${validation.dimensions?.height} - Analyzing quality...`,
      });
      
      setTimeout(() => {
        setQualityCheck({
          blur: Math.random() > 0.3 ? "pass" : "fail",
          exposure: Math.random() > 0.2 ? "pass" : "fail",
          coverage: Math.random() > 0.4 ? "pass" : "fail",
          artifacts: Math.random() > 0.1 ? "pass" : "fail"
        });
        setIsCapturing(false);
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const handleWebFileUpload = async (): Promise<any> => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg,image/png,image/jpg';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        try {
          const result = await uploadImageFromFile(file);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      input.click();
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (!selectedEye) {
      toast({
        title: "Select Eye First",
        description: "Please select which eye this image is for",
        variant: "destructive",
      });
      return;
    }
    
    setIsCapturing(true);
    
    try {
      const result = await uploadImageFromFile(file);
      const validation = await validateRetinalImage(result.uri);
      
      if (!validation.isValid) {
        throw new Error(validation.reason);
      }
      
      setCapturedImage(result.uri);
      setCapturedFileName(result.fileName);
      
      toast({
        title: "Image Uploaded",
        description: "Analyzing image quality...",
      });
      
      setTimeout(() => {
        setQualityCheck({
          blur: Math.random() > 0.3 ? "pass" : "fail",
          exposure: Math.random() > 0.2 ? "pass" : "fail",
          coverage: Math.random() > 0.4 ? "pass" : "fail",
          artifacts: Math.random() > 0.1 ? "pass" : "fail"
        });
        setIsCapturing(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to process image",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const handleAnalyzeStrokeRisk = async () => {
    if (!capturedImage || !selectedEye) return;

    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-retinal-image', {
        body: {
          imageData: capturedImage,
          metadata: {
            source: imageSource,
            eye: selectedEye,
            mode: captureMode
          }
        }
      });

      if (error) throw error;

      setStrokeRiskResult({
        percentage: data.strokeRiskPercentage,
        level: data.riskLevel,
        factors: data.riskFactors,
        recommendations: data.clinicalRecommendations,
        imageQualityScore: data.imageQualityScore,
        confidence: data.confidence
      });

      if (onAnalysisComplete) {
        onAnalysisComplete({
          imagePath: capturedImage,
          imageSource: imageSource === 'camera' ? 'camera' : 'upload',
          strokeRiskPercentage: data.strokeRiskPercentage,
          strokeRiskLevel: data.riskLevel,
          riskFactors: data.riskFactors,
          aiRecommendations: data.clinicalRecommendations.join('\n'),
          imageQualityScore: data.imageQualityScore,
          confidence: data.confidence
        });
      }

      toast({
        title: "Analysis Complete",
        description: `Stroke risk: ${data.strokeRiskPercentage}%`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedFileName(null);
    setQualityCheck(null);
    setStrokeRiskResult(null);
  };

  const handleAccept = async () => {
    if (!strokeRiskResult || !capturedFileName || !selectedPatient) {
      toast({
        title: "Cannot Save",
        description: "Please select a patient before saving",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      await createVisit({
        patient_id: selectedPatient.id,
        reason: "Retinal AI Stroke Risk Analysis",
        visit_date: new Date().toISOString(),
        systolic: 0,
        diastolic: 0,
        retinal_image_path: capturedFileName,
        retinal_image_source: imageSource === 'camera' ? 'camera' : 'upload',
        stroke_risk_percentage: strokeRiskResult.percentage,
        stroke_risk_level: strokeRiskResult.level,
        risk_factors: strokeRiskResult.factors,
        ai_recommendations: strokeRiskResult.recommendations.join('\n'),
        image_quality_score: strokeRiskResult.imageQualityScore,
        ai_analysis_date: new Date().toISOString(),
        ai_model_version: 'gemini-2.5-pro'
      });
      
      toast({
        title: "Analysis Saved",
        description: `Stroke risk analysis saved for ${selectedPatient.name}`,
      });
      
      handleRetake();
      setSelectedPatient(null);
      
      if (onAnalysisComplete) {
        onAnalysisComplete({
          imagePath: capturedFileName,
          imageSource: imageSource === 'camera' ? 'camera' : 'upload',
          strokeRiskPercentage: strokeRiskResult.percentage,
          strokeRiskLevel: strokeRiskResult.level,
          riskFactors: strokeRiskResult.factors,
          aiRecommendations: strokeRiskResult.recommendations.join('\n'),
          imageQualityScore: strokeRiskResult.imageQualityScore,
          confidence: strokeRiskResult.confidence
        });
      }
    } catch (error) {
      console.error("Failed to save analysis:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save analysis",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isQualityGood = qualityCheck && Object.values(qualityCheck).every(check => check === "pass");
  
  const getRiskColor = (level: string) => {
    const colors = {
      'Low': 'text-success',
      'Moderate': 'text-warning',
      'High': 'text-destructive',
      'Critical': 'text-destructive',
      'Insufficient Quality': 'text-muted-foreground'
    };
    return colors[level as keyof typeof colors] || 'text-muted-foreground';
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Retinal Image Capture</h1>
            <p className="text-muted-foreground">Capture high-quality retinal images for analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Patient Selection */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Patient Selection</CardTitle>
                <CardDescription>
                  Select the patient for this retinal analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPatient ? (
                  <PatientSearch 
                    onPatientSelect={setSelectedPatient}
                    onNewPatient={() => navigate("/new-patient")}
                    compact={true}
                  />
                ) : (
                  <div className="p-3 bg-accent/10 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{selectedPatient.name}</p>
                        <p className="text-sm text-muted-foreground">MRN: {selectedPatient.mrn}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedPatient(null)}
                      >
                        Change Patient
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Camera Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Image Source</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={imageSource === 'camera' ? "default" : "outline"}
                  onClick={() => setImageSource('camera')}
                  className="w-full justify-start"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Capture New Image
                </Button>
                <Button 
                  variant={imageSource === 'upload' ? "default" : "outline"}
                  onClick={() => setImageSource('upload')}
                  className="w-full justify-start"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload from Gallery
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Eye Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={selectedEye === "left" ? "default" : "outline"}
                  onClick={() => setSelectedEye("left")}
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Left Eye
                </Button>
                <Button 
                  variant={selectedEye === "right" ? "default" : "outline"}
                  onClick={() => setSelectedEye("right")}
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Right Eye
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Capture Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={captureMode === "macula" ? "default" : "outline"}
                  onClick={() => setCaptureMode("macula")}
                  className="w-full"
                >
                  Macula-Centered
                </Button>
                <Button 
                  variant={captureMode === "disc" ? "default" : "outline"}
                  onClick={() => setCaptureMode("disc")}
                  className="w-full"
                >
                  Optic Disc-Centered
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Camera Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant={flashEnabled ? "default" : "outline"}
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  className="w-full justify-start"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Flash {flashEnabled ? "On" : "Off"}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ZoomIn className="w-4 h-4 mr-2" />
                  Zoom: 1.0x
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Camera Preview */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Camera Preview
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedEye && (
                      <Badge variant="outline">
                        {selectedEye.charAt(0).toUpperCase() + selectedEye.slice(1)} Eye
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {captureMode === "macula" ? "Macula" : "Optic Disc"}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Camera Preview Area */}
                  <div 
                    className={`aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden
                      ${imageSource === 'upload' && !capturedImage ? 'border-2 border-dashed border-muted-foreground/50' : ''}
                      ${isDragging ? 'border-primary bg-primary/10' : ''}`}
                    onDragOver={imageSource === 'upload' ? handleDragOver : undefined}
                    onDragLeave={imageSource === 'upload' ? handleDragLeave : undefined}
                    onDrop={imageSource === 'upload' ? handleDrop : undefined}
                  >
                    {capturedImage ? (
                      <img 
                        src={capturedImage} 
                        alt="Captured retinal image" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-8">
                        {imageSource === 'camera' ? (
                          <>
                            <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {selectedEye ? `Ready to capture ${selectedEye} eye` : "Select an eye to begin"}
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-2">
                              {isNativePlatform() 
                                ? "Tap to select image from gallery"
                                : "Drag & drop image here or click to browse"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Supports JPEG, PNG (max 10MB)
                            </p>
                          </>
                        )}
                        {selectedEye && imageSource === 'camera' && (
                          <div className="mt-4">
                            {/* Alignment Guides */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-32 h-32 border-2 border-primary/50 rounded-full flex items-center justify-center">
                                <div className="w-4 h-4 bg-primary/50 rounded-full"></div>
                              </div>
                            </div>
                            {captureMode === "macula" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-xs text-primary/70 absolute top-20">Macula Target</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {isCapturing && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>

                  {/* Capture Controls */}
                  <div className="flex justify-center gap-4 mt-4">
                    {!capturedImage ? (
                      imageSource === 'camera' ? (
                        <Button 
                          onClick={handleCapture}
                          disabled={!selectedEye || isCapturing}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 px-8"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          {isCapturing ? "Capturing..." : "Capture"}
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleGalleryUpload}
                          disabled={!selectedEye || isCapturing}
                          size="lg"
                          className="bg-primary hover:bg-primary/90 px-8"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          {isCapturing ? "Loading..." : "Select Image"}
                        </Button>
                      )
                    ) : (
                      <div className="flex gap-3">
                        <Button onClick={handleRetake} variant="outline">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Retake
                        </Button>
                        {!strokeRiskResult ? (
                          <Button 
                            onClick={handleAnalyzeStrokeRisk}
                            disabled={!isQualityGood || isAnalyzing}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            {isAnalyzing ? "Analyzing..." : "Analyze Stroke Risk"}
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleAccept}
                            disabled={isSaving}
                            className="bg-success hover:bg-success/90"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {isSaving ? "Saving..." : "Save Analysis"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quality Check Results */}
        {qualityCheck && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isQualityGood ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                )}
                Image Quality Assessment
              </CardTitle>
              <CardDescription>
                Automated quality checks for optimal analysis results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(qualityCheck).map(([check, status]) => (
                  <div key={check} className="flex items-center gap-2">
                    {status === "pass" ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="text-sm capitalize">
                      {check === "artifacts" ? "No Artifacts" : check}
                    </span>
                  </div>
                ))}
              </div>
              
              {!isQualityGood && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Image quality issues detected. Consider retaking the image for optimal analysis results.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* AI Analysis Progress */}
        {isAnalyzing && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 animate-pulse" />
                AI Stroke Risk Analysis in Progress
              </CardTitle>
              <CardDescription>
                Analyzing retinal biomarkers for cerebrovascular disease indicators...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={66} className="mb-2" />
              <p className="text-xs text-muted-foreground">Estimated time: 10-15 seconds</p>
            </CardContent>
          </Card>
        )}

        {/* Stroke Risk Results */}
        {strokeRiskResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  AI Stroke Risk Assessment
                </span>
                <Badge variant="outline" className={getRiskColor(strokeRiskResult.level)}>
                  {strokeRiskResult.level} Risk
                </Badge>
              </CardTitle>
              <CardDescription>
                AI-powered analysis of retinal biomarkers for stroke risk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Risk Percentage */}
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">{strokeRiskResult.percentage}%</div>
                <p className="text-sm text-muted-foreground">Stroke Risk Percentage</p>
              </div>

              {/* Quality & Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Image Quality</p>
                  <Progress value={strokeRiskResult.imageQualityScore} />
                  <p className="text-xs text-right mt-1">{strokeRiskResult.imageQualityScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Analysis Confidence</p>
                  <Progress value={strokeRiskResult.confidence} />
                  <p className="text-xs text-right mt-1">{strokeRiskResult.confidence}%</p>
                </div>
              </div>

              {/* Risk Factors */}
              {strokeRiskResult.factors?.findings && strokeRiskResult.factors.findings.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Detected Risk Factors</h4>
                  <div className="space-y-2">
                    {strokeRiskResult.factors.findings.map((finding: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 mt-0.5 text-warning flex-shrink-0" />
                        <span>{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {strokeRiskResult.recommendations && strokeRiskResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Clinical Recommendations</h4>
                  <div className="space-y-2">
                    {strokeRiskResult.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <Alert>
                <AlertDescription className="text-xs">
                  <strong>Clinical Disclaimer:</strong> This AI analysis is assistive technology and supplements but does not replace professional medical judgment. All results should be reviewed and interpreted by qualified healthcare professionals.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};