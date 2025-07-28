import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileData {
  name: string;
  birthday: string;
  phone: string;
  instagram: string;
  email: string;
  password: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (newData: ProfileData) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'Anna Avetisyan',
    birthday: 'Birthday',
    phone: '818 123 4567',
    instagram: 'Instagram account',
    email: 'info@aplusdesign.co',
    password: 'Password',
  });

  const updateProfile = (newData: ProfileData) => {
    setProfileData(newData);
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}; 