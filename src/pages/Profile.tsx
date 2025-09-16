import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { profile, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    hospital_name: profile?.hospital_name || '',
    hospital_location: profile?.hospital_location || '',
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message,
        });
      } else {
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been successfully updated.',
        });
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      email: profile?.email || '',
      hospital_name: profile?.hospital_name || '',
      hospital_location: profile?.hospital_location || '',
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Profile...</h2>
          <p className="text-muted-foreground">Please wait while we load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue via-medical-teal to-medical-green p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Doctor Profile</CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hospital_name">Hospital Name</Label>
                <Input
                  id="hospital_name"
                  name="hospital_name"
                  value={formData.hospital_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hospital_location">Hospital Location</Label>
                <Input
                  id="hospital_location"
                  name="hospital_location"
                  value={formData.hospital_location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4">
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            <div className="pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Account Actions</p>
                  <p className="text-sm text-muted-foreground">
                    Logout from your account
                  </p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p>Account created: {new Date(profile.created_at).toLocaleDateString()}</p>
              <p>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;