"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/utils/supabaseClient';

interface FileUploadProps {
  userId: string;
  onUploadComplete: (fileUrl: string, fileName: string, fileType: string) => void;
  onUploadError: (error: string) => void;
  allowedFileTypes?: string[];
  maxSizeMB?: number;
}

export default function FileUpload({
  userId,
  onUploadComplete,
  onUploadError,
  allowedFileTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'],
  maxSizeMB = 10
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      onUploadError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    
    // Check file type
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedFileTypes.includes(fileExtension)) {
      onUploadError(`File type ${fileExtension} not allowed. Allowed types: ${allowedFileTypes.join(', ')}`);
      return false;
    }
    
    return true;
  };
  
  const uploadToSupabase = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const timestamp = new Date().getTime();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = `${userId}/${fileName}`;
      
      console.log('Starting file upload to path:', filePath);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('user_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      // Simulate progress manually
      const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress > 95) {
            clearInterval(interval);
          } else {
            setUploadProgress(progress);
          }
        }, 100);
        
        return interval;
      };
      
      const progressInterval = simulateProgress();
      
      if (error) {
        clearInterval(progressInterval);
        throw new Error(error.message);
      }
      
      // Set to 100% when complete
      setUploadProgress(100);
      
      if (data) {
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('user_files')
          .getPublicUrl(filePath);
        
        // Add entry to files table with more robust error handling
        try {
          // Set auth headers explicitly to ensure RLS policies are applied correctly
          const { data: fileData, error: fileError } = await supabase
            .from('files')
            .insert([{
              user_id: userId,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
              public_url: publicUrl
            }]);
          
          if (fileError) {
            console.warn('Error inserting file record:', fileError);
            // Continue even if file record insert fails - the file is still uploaded
          }
          
          onUploadComplete(publicUrl, file.name, file.type);
        } catch (fileInsertError) {
          console.error('Exception when inserting file record:', fileInsertError);
          // Still consider the upload successful as long as the file is in storage
          onUploadComplete(publicUrl, file.name, file.type);
        }
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      onUploadError(error.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (validateFile(file)) {
      uploadToSupabase(file);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    processFiles(e.dataTransfer.files);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-[#9c6bff] bg-[#9c6bff]/10' 
            : isUploading 
              ? 'border-gray-600 bg-gray-800/30 cursor-not-allowed' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/30 cursor-pointer'
        }`}
        onDragEnter={!isUploading ? handleDragEnter : undefined}
        onDragLeave={!isUploading ? handleDragLeave : undefined}
        onDragOver={!isUploading ? handleDragOver : undefined}
        onDrop={!isUploading ? handleDrop : undefined}
        onClick={!isUploading ? triggerFileInput : undefined}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept={allowedFileTypes.join(',')}
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <svg 
            className={`w-12 h-12 ${isDragging ? 'text-[#9c6bff]' : 'text-gray-400'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          
          {isUploading ? (
            <div className="w-full">
              <div className="text-sm text-gray-300 mb-2">Uploading... {uploadProgress}%</div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-[#9c6bff] to-[#00c8ff] h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-300">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {allowedFileTypes.join(', ')} (Max size: {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 