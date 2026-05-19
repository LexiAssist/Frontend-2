"use client";

import { useState, useRef } from "react";
import { FeatureHeader } from "@/components/FeatureHeader";
import { FileText, Upload, Trash2, Search, File, FileCode, ImageIcon, Plus, FolderOpen, Edit2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { materialApi, courseApi } from "@/services/api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Course } from "@/types";

export default function MaterialsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseFormData, setCourseFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    semester: "",
    year: new Date().getFullYear(),
  });

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialApi.getAll(50, 0),
  });

  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseApi.getAll(50, 0),
  });

  const { mutate: deleteMaterial, isPending: isDeleting } = useMutation({
    mutationFn: materialApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success("Material deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete material");
    },
  });

  const { mutate: createCourse, isPending: isCreatingCourse } = useMutation({
    mutationFn: courseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Course created successfully");
      setShowCourseModal(false);
      resetCourseForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create course");
    },
  });

  const { mutate: updateCourse, isPending: isUpdatingCourse } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof courseFormData> }) =>
      courseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Course updated successfully");
      setShowCourseModal(false);
      resetCourseForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update course");
    },
  });

  const { mutate: deleteCourse, isPending: isDeletingCourse } = useMutation({
    mutationFn: courseApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Course deleted successfully");
      if (selectedCourseId) {
        setSelectedCourseId(null);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete course");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 50MB as per requirements)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large (max 50MB)");
      return;
    }

    // Validate file type (PDF, DOCX, TXT, MD as per requirements)
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast.error("Invalid file type. Only PDF, DOCX, TXT, and MD files are allowed.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);

    try {
      await materialApi.upload(file, selectedCourseId || undefined);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast.success("File uploaded successfully", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload file", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const resetCourseForm = () => {
    setCourseFormData({
      name: "",
      description: "",
      color: "#3b82f6",
      semester: "",
      year: new Date().getFullYear(),
    });
    setEditingCourse(null);
  };

  const handleOpenCourseModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        name: course.name,
        description: course.description || "",
        color: course.color || "#3b82f6",
        semester: course.semester || "",
        year: course.year || new Date().getFullYear(),
      });
    } else {
      resetCourseForm();
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = () => {
    if (!courseFormData.name.trim()) {
      toast.error("Course name is required");
      return;
    }

    if (editingCourse) {
      updateCourse({ id: editingCourse.id, data: courseFormData });
    } else {
      createCourse(courseFormData);
    }
  };

  const getFileIcon = (contentType: string | undefined) => {
    if (!contentType) return <File className="w-8 h-8 text-[var(--primary-500)]" />;
    if (contentType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (contentType.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (contentType.includes('text')) return <FileCode className="w-8 h-8 text-gray-500" />;
    return <File className="w-8 h-8 text-[var(--primary-500)]" />;
  };

  const filteredMaterials = materials?.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = !selectedCourseId || m.course_id === selectedCourseId;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10 pt-8 gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-tight font-bold">
            Course Materials
          </h1>
          <p className="text-[#555c56] text-sm sm:text-base">
            Upload and manage your study documents
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent w-full md:w-64"
            />
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden" 
            accept=".pdf,.txt,.md,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 bg-[var(--primary-500)] text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-600)] transition-colors disabled:opacity-70 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          </button>
          
          <FeatureHeader />
        </div>
      </div>

      {/* Course Management Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
          <button
            onClick={() => handleOpenCourseModal()}
            className="flex items-center gap-2 text-[var(--primary-500)] hover:text-[var(--primary-600)] text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
        </div>

        {isLoadingCourses ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 w-48 bg-slate-100 animate-pulse rounded-lg flex-shrink-0" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCourseId(null)}
              className={`px-4 py-3 rounded-lg border-2 transition-all flex-shrink-0 ${
                selectedCourseId === null
                  ? 'border-[var(--primary-500)] bg-[var(--primary-50)] text-[var(--primary-700)]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                <span className="font-medium">All Materials</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {materials?.length || 0} files
              </div>
            </button>

            {courses.map((course) => (
              <div
                key={course.id}
                className={`px-4 py-3 rounded-lg border-2 transition-all flex-shrink-0 group relative ${
                  selectedCourseId === course.id
                    ? 'border-[var(--primary-500)] bg-[var(--primary-50)]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setSelectedCourseId(course.id)}
                  className="text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: course.color || '#3b82f6' }}
                    />
                    <span className="font-medium text-slate-900">{course.name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {materials?.filter(m => m.course_id === course.id).length || 0} files
                    {course.semester && ` • ${course.semester}`}
                    {course.year && ` ${course.year}`}
                  </div>
                </button>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCourseModal(course);
                    }}
                    className="p-1 text-slate-400 hover:text-[var(--primary-500)] hover:bg-[var(--primary-50)] rounded"
                    aria-label="Edit course"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${course.name}"? Materials will not be deleted.`)) {
                        deleteCourse(course.id);
                      }
                    }}
                    disabled={isDeletingCourse}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                    aria-label="Delete course"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-slate-500 mb-3">No courses yet. Create one to organize your materials.</p>
            <button
              onClick={() => handleOpenCourseModal()}
              className="text-[var(--primary-500)] hover:text-[var(--primary-600)] font-medium text-sm"
            >
              Create First Course
            </button>
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredMaterials && filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.filter(Boolean).map((material) => (
            <div key={material?.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  {getFileIcon(material?.content_type)}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this file?')) {
                      deleteMaterial(material.id);
                    }
                  }}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="font-semibold text-slate-900 truncate mb-1" title={material.title}>
                {material.title}
              </h3>
              
              {material.course_id && courses && (
                <div className="flex items-center gap-1 mb-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: courses.find(c => c.id === material.course_id)?.color || '#3b82f6' }}
                  />
                  <span className="text-xs text-slate-500">
                    {courses.find(c => c.id === material.course_id)?.name}
                  </span>
                </div>
              )}
              
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-50">
                <span>{(material.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span>{formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}</span>
              </div>
              
              {material.processing_status && (
                <div className={`mt-2 text-[10px] px-2 py-1 rounded-full inline-block self-start ${
                  material.processing_status === 'completed' ? 'bg-green-100 text-green-700' :
                  material.processing_status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {material.processing_status === 'completed' ? 'AI Ready' : 
                   material.processing_status === 'pending' || material.processing_status === 'processing' ? 'Processing...' : 
                   'Processing Failed'}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl border-dashed">
          <div className="w-16 h-16 bg-[var(--primary-50)] text-[var(--primary-500)] rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No materials found</h2>
          <p className="text-slate-500 text-center max-w-md mb-6">
            {searchQuery 
              ? `No files matching "${searchQuery}". Try a different search term.`
              : selectedCourseId
              ? "No materials in this course yet. Upload files to get started."
              : "Upload your course materials, PDFs, and notes to use them with the AI StudyBuddy."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-lg hover:bg-[var(--primary-600)] transition-colors font-medium flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload First File</span>
            </button>
          )}
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                  placeholder="e.g., Introduction to Computer Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Brief description of the course"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={courseFormData.semester}
                    onChange={(e) => setCourseFormData({ ...courseFormData, semester: e.target.value })}
                    placeholder="e.g., Fall"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={courseFormData.year}
                    onChange={(e) => setCourseFormData({ ...courseFormData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    placeholder="2024"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Color
                </label>
                <div className="flex gap-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCourseFormData({ ...courseFormData, color })}
                      className={`w-8 h-8 rounded-full transition-all ${
                        courseFormData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={isCreatingCourse || isUpdatingCourse}
                className="flex-1 px-4 py-2 bg-[var(--primary-500)] text-white rounded-lg hover:bg-[var(--primary-600)] transition-colors disabled:opacity-70"
              >
                {isCreatingCourse || isUpdatingCourse ? 'Saving...' : editingCourse ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
