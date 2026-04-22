// Dynamic Task Form Component using React Hook Form
import React, { useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TASK_TYPES, PRIORITIES, BUG_SEVERITIES } from '../api/mockApi';

const AUTO_SAVE_KEY = 'taskFormAutoSave';

const TaskForm = ({
  isOpen,
  mode,
  initialData = null,
  onSubmit,
  onClose,
  users = [],
  projects = [],
  loading = false
}) => {

  // Default form values
  const defaultValues = useMemo(() => ({
    title: '',
    taskType: 'Bug',
    priority: 'Medium',
    projectId: '',
    assigneeId: '',
    description: '',
    dueDate: '',
    // Bug fields
    severity: 'Medium',
    stepsToReproduce: '',
    // Feature fields
    businessValue: '',
    acceptanceCriteria: [],
    // Enhancement fields
    currentBehavior: '',
    proposedBehavior: '',
    // Research fields
    researchQuestions: [],
    expectedOutcomes: '',
    // Common
    subtasks: [],
  }), []);

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: initialData || defaultValues,
    mode: 'onChange',
  });

  // Field arrays for dynamic lists
  const { fields: subtaskFields, append: addSubtask, remove: removeSubtask, replace: replaceSubtasks } = useFieldArray({
    control,
    name: 'subtasks',
  });

  const { fields: criteriaFields, append: addCriteria, remove: removeCriteria, replace: replaceCriteria } = useFieldArray({
    control,
    name: 'acceptanceCriteria',
  });

  const { fields: questionFields, append: addQuestion, remove: removeQuestion, replace: replaceQuestions } = useFieldArray({
    control,
    name: 'researchQuestions',
  });

  // Watch task type for dynamic fields
  const watchedTaskType = watch('taskType');
  const watchedProjectId = watch('projectId');

  // Filter users based on selected project
  const filteredUsers = useMemo(() => {
    if (!watchedProjectId) return users;
    const project = projects.find(p => p.id === watchedProjectId);
    if (!project) return users;
    return users.filter(user => project.userIds?.includes(user.id));
  }, [watchedProjectId, users, projects]);

  // Reset form when initialData changes (edit mode)
  useEffect(() => {
    if (isOpen && initialData) {
      // Edit mode: populate with existing task data
      reset({
        ...defaultValues,
        ...initialData,
        subtasks: initialData.subtasks || [],
        acceptanceCriteria: initialData.acceptanceCriteria
          ? initialData.acceptanceCriteria.map(c => typeof c === 'string' ? { value: c } : c)
          : [],
      });
    } else if (isOpen && !initialData) {
      // Create mode: always start fresh
      localStorage.removeItem(AUTO_SAVE_KEY);
      reset(defaultValues);
      replaceSubtasks([]);
      replaceCriteria([]);
      replaceQuestions([]);
    } else if (!isOpen) {
      reset(defaultValues);
      replaceSubtasks([]);
      replaceCriteria([]);
      replaceQuestions([]);
    }
  }, [isOpen, initialData, reset, defaultValues, replaceSubtasks, replaceCriteria, replaceQuestions]);

  // Handle form submission
  const onFormSubmit = (data) => {
    // Clean up data based on task type
    const cleanedData = { ...data };

    if (data.taskType !== 'Bug') {
      delete cleanedData.severity;
      delete cleanedData.stepsToReproduce;
    }
    if (data.taskType !== 'Feature') {
      delete cleanedData.businessValue;
      delete cleanedData.acceptanceCriteria;
    } else if (cleanedData.acceptanceCriteria) {
      cleanedData.acceptanceCriteria = cleanedData.acceptanceCriteria.map(c => c.value || c);
    }
    if (data.taskType !== 'Enhancement') {
      delete cleanedData.currentBehavior;
      delete cleanedData.proposedBehavior;
    }
    if (data.taskType !== 'Research') {
      delete cleanedData.researchQuestions;
      delete cleanedData.expectedOutcomes;
    } else if (cleanedData.researchQuestions) {
      cleanedData.researchQuestions = cleanedData.researchQuestions.map(q => q.value || q);
    }

    localStorage.removeItem(AUTO_SAVE_KEY);
    reset(defaultValues);
    replaceSubtasks([]);
    replaceCriteria([]);
    replaceQuestions([]);
    onSubmit(cleanedData);
  };

  // Handle close
  const handleClose = () => {
    localStorage.removeItem(AUTO_SAVE_KEY);
    onClose();
  };

  // Render dynamic fields based on task type
  const renderDynamicFields = () => {
    switch (watchedTaskType) {
      case 'Bug':
        return (
          <>
            <div className="form-group">
              <label>Severity *</label>
              <select {...register('severity', { required: 'Severity is required' })}>
                {BUG_SEVERITIES.map(sev => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
              {errors.severity && <span className="form-error">{errors.severity.message}</span>}
            </div>

            <div className="form-group">
              <label>Steps to Reproduce</label>
              <textarea
                {...register('stepsToReproduce')}
                placeholder="1. Step one&#10;2. Step two&#10;3. Expected vs actual result"
                rows={4}
              />
            </div>
          </>
        );

      case 'Feature':
        return (
          <>
            <div className="form-group">
              <label>Business Value</label>
              <textarea
                {...register('businessValue')}
                placeholder="Describe the business value..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Acceptance Criteria</label>
              {criteriaFields.map((field, index) => (
                <div key={field.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    {...register(`acceptanceCriteria.${index}.value`)}
                    placeholder={`Criteria ${index + 1}`}
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removeCriteria(index)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addCriteria({ value: '' })} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>
                + Add Criteria
              </button>
            </div>
          </>
        );

      case 'Enhancement':
        return (
          <>
            <div className="form-group">
              <label>Current Behavior</label>
              <textarea
                {...register('currentBehavior')}
                placeholder="Describe the current behavior..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Proposed Behavior</label>
              <textarea
                {...register('proposedBehavior')}
                placeholder="Describe the proposed behavior..."
                rows={3}
              />
            </div>
          </>
        );

      case 'Research':
        return (
          <>
            <div className="form-group">
              <label>Research Questions</label>
              {questionFields.map((field, index) => (
                <div key={field.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    {...register(`researchQuestions.${index}.value`)}
                    placeholder={`Question ${index + 1}`}
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => removeQuestion(index)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addQuestion({ value: '' })} style={{ background: '#9b59b6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>
                + Add Question
              </button>
            </div>

            <div className="form-group">
              <label>Expected Outcomes</label>
              <textarea
                {...register('expectedOutcomes')}
                placeholder="Describe expected outcomes..."
                rows={3}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="task-form-overlay">
      <div className="task-form">
        <div className="task-form-header">
          <h2>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</h2>
          <button onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)}>
          {/* Title */}
          <div className="form-group">
            <label>Title *</label>
            <input
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
                maxLength: { value: 50, message: 'Title must not exceed 50 characters' }
              })}
              placeholder="Enter task title..."
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          {/* Task Type */}
          <div className="form-group">
            <label>Task Type *</label>
            <select {...register('taskType', { required: 'Task type is required' })}>
              {TASK_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.taskType && <span className="form-error">{errors.taskType.message}</span>}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label>Priority *</label>
            <select {...register('priority', { required: 'Priority is required' })}>
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.priority && <span className="form-error">{errors.priority.message}</span>}
          </div>

          {/* Project */}
          <div className="form-group">
            <label>Project</label>
            <select {...register('projectId')}>
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div className="form-group">
            <label>Assignee</label>
            <select {...register('assigneeId')}>
              <option value="">Unassigned</option>
              {filteredUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              {...register('description')}
              placeholder="Enter task description..."
              rows={4}
            />
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('dueDate')}
            />
          </div>

          {/* Dynamic Fields based on Task Type */}
          {renderDynamicFields()}

          {/* Subtasks */}
          <div className="form-group">
            <label>Subtasks</label>
            {subtaskFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  {...register(`subtasks.${index}.title`)}
                  placeholder={`Subtask ${index + 1}`}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => removeSubtask(index)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addSubtask({ title: '', completed: false })} style={{ background: '#34495e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>
              + Add Subtask
            </button>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;