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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-10 pt-8 gap-5 border-b border-slate-100 pb-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[#272a28] text-2xl sm:text-3xl tracking-[-0.035em] font-black leading-tight">
            Course Materials
          </h1>
          <p className="text-[#555c56] text-sm sm:text-[15px] font-medium leading-relaxed">
            Upload and manage your study documents
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] w-full md:w-64 transition-all shadow-sm"
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
            className="flex items-center gap-2 bg-[var(--primary-500)] text-white px-5 py-2.5 rounded-xl hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all disabled:opacity-70 whitespace-nowrap font-bold text-sm shadow-md shadow-emerald-800/10"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Uploading..." : "Upload File"}</span>
          </button>
          
          <FeatureHeader />
        </div>
      </div>

      {/* Course Management Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold tracking-tight uppercase text-slate-400">Courses</h2>
          <button
            onClick={() => handleOpenCourseModal()}
            className="flex items-center gap-1.5 text-[var(--primary-500)] hover:text-[var(--primary-600)] text-sm font-bold active:scale-[0.97] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Course</span>
          </button>
        </div>

        {isLoadingCourses ? (
          <div className="flex gap-4 overflow-x-auto pb-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 w-48 bg-slate-50 animate-pulse rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <div className="flex gap-3.5 overflow-x-auto pb-3">
            <button
              onClick={() => setSelectedCourseId(null)}
              className={`px-5 py-4 rounded-2xl border transition-all flex-shrink-0 text-left active:scale-[0.97] shadow-sm ${
                selectedCourseId === null
                  ? 'border-[var(--primary-500)] bg-[#EAF4EE]/60 text-[var(--primary-800)]'
                  : 'border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen className="w-5 h-5 text-[var(--primary-600)]" />
                <span className="font-bold text-[15px]">All Materials</span>
              </div>
              <div className="text-xs font-semibold text-slate-400 mt-1.5">
                {materials?.length || 0} files
              </div>
            </button>

            {courses.map((course) => (
              <div
                key={course.id}
                className={`px-5 py-4 rounded-2xl border transition-all flex-shrink-0 group relative active:scale-[0.97] shadow-sm ${
                  selectedCourseId === course.id
                    ? 'border-[var(--primary-500)] bg-[#EAF4EE]/60'
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/50'
                }`}
              >
                <button
                  onClick={() => setSelectedCourseId(course.id)}
                  className="text-left w-full pr-8"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: course.color || '#3b82f6' }}
                    />
                    <span className="font-bold text-[15px] text-slate-800 truncate max-w-[120px]">{course.name}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-1.5">
                    {materials?.filter(m => m.course_id === course.id).length || 0} files
                    {course.semester && ` • ${course.semester}`}
                    {course.year && ` ${course.year}`}
                  </div>
                </button>
                
                <div className="absolute top-3 right-2 px-1 py-0.5 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCourseModal(course);
                    }}
                    className="p-1 text-slate-400 hover:text-[var(--primary-500)] hover:bg-[#EAF4EE] rounded-md transition"
                    aria-label="Edit course"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete "${course.name}"? Materials will not be deleted.`)) {
                        deleteCourse(course.id);
                      }
                    }}
                    disabled={isDeletingCourse}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                    aria-label="Delete course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 max-w-lg">
            <p className="text-slate-500 font-medium mb-3 text-sm">No courses yet. Create one to organize your materials.</p>
            <button
              onClick={() => handleOpenCourseModal()}
              className="text-[var(--primary-500)] hover:text-[var(--primary-600)] font-bold text-sm active:scale-[0.98] transition-all"
            >
              Create First Course
            </button>
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredMaterials && filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.filter(Boolean).map((material) => (
            <div key={material?.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex flex-col group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#FAF9F5] border border-slate-100/50 rounded-xl shrink-0">
                  {getFileIcon(material?.content_type)}
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this file?')) {
                      deleteMaterial(material.id);
                    }
                  }}
                  disabled={isDeleting}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition opacity-0 group-hover:opacity-100"
                  aria-label="Delete file"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <h3 className="font-bold text-slate-800 text-[15px] truncate mb-1" title={material.title}>
                {material.title}
              </h3>
              
              {material.course_id && courses && (
                <div className="flex items-center gap-1.5 mt-1 bg-slate-50 border border-slate-100/60 px-2 py-0.5 rounded-md self-start text-xs font-semibold text-slate-500">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: courses.find(c => c.id === material.course_id)?.color || '#3b82f6' }}
                  />
                  <span>
                    {courses.find(c => c.id === material.course_id)?.name}
                  </span>
                </div>
              )}
              
              <div className="mt-5 pt-3.5 flex items-center justify-between text-[11px] font-bold text-slate-400 border-t border-slate-100 uppercase tracking-wide">
                <span>{(material.file_size / 1024 / 1024).toFixed(2)} MB</span>
                <span>{formatDistanceToNow(new Date(material.created_at), { addSuffix: true })}</span>
              </div>
              
              {material.processing_status && (
                <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full inline-block self-start shadow-sm border ${
                  material.processing_status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                  material.processing_status === 'failed' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                  'bg-blue-50 border-blue-100 text-blue-700 animate-pulse'
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
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-2xl border-dashed border-2 shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-[#EAF4EE] text-[var(--primary-500)] rounded-full flex items-center justify-center mb-4 shadow-inner">
            <FileText className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 mb-2">No materials found</h2>
          <p className="text-slate-500 text-center max-w-sm mb-6 text-sm font-medium leading-relaxed">
            {searchQuery 
              ? `No files matching "${searchQuery}". Try a different search term.`
              : selectedCourseId
              ? "No materials in this course yet. Upload files to get started."
              : "Upload your course materials, PDFs, and notes to use them with the AI StudyBuddy."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[var(--primary-500)] text-white px-6 py-2.5 rounded-xl hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all font-bold flex items-center gap-2 text-sm shadow-md shadow-emerald-800/10"
            >
              <Upload className="w-4 h-4" />
              <span>Upload First File</span>
            </button>
          )}
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Course Name *
                </label>
                <input
                  type="text"
                  value={courseFormData.name}
                  onChange={(e) => setCourseFormData({ ...courseFormData, name: e.target.value })}
                  placeholder="e.g., Introduction to Computer Science"
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Brief description of the course"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all resize-none text-slate-700 leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={courseFormData.semester}
                    onChange={(e) => setCourseFormData({ ...courseFormData, semester: e.target.value })}
                    placeholder="e.g., Fall"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={courseFormData.year}
                    onChange={(e) => setCourseFormData({ ...courseFormData, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    placeholder="2024"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6]/40 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Color Accent
                </label>
                <div className="flex gap-2.5 pt-1">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setCourseFormData({ ...courseFormData, color })}
                      className={`w-7 h-7 rounded-full hover:scale-110 active:scale-90 transition-all ${
                        courseFormData.color === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 border-t border-slate-100 pt-6">
              <button
                onClick={() => {
                  setShowCourseModal(false);
                  resetCourseForm();
                }}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCourse}
                disabled={isCreatingCourse || isUpdatingCourse}
                className="flex-1 px-4 py-3 bg-[var(--primary-500)] text-white rounded-xl hover:bg-[var(--primary-600)] active:scale-[0.98] transition-all disabled:opacity-70 font-bold text-sm shadow-md shadow-emerald-800/10"
              >
                {isCreatingCourse || isUpdatingCourse ? 'Saving...' : editingCourse ? 'Update' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}