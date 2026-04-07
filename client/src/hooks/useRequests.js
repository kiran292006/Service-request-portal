import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const useRequests = () => {
    const queryClient = useQueryClient();

    // Get my requests
    const useMyRequests = (options = {}) => useQuery({
        queryKey: ['my-requests'],
        queryFn: async () => {
            const res = await api.get('/requests');
            return res.data;
        },
        ...options
    });

    // Get single request
    const useRequest = (id) => useQuery({
        queryKey: ['request', id],
        queryFn: async () => {
            const res = await api.get(`/requests/${id}`);
            return res.data;
        },
        enabled: !!id,
        retry: (failureCount, error) => {
            // Don't retry on 404 (ticket not found) or 403 (forbidden)
            if (error?.response?.status === 404 || error?.response?.status === 403) return false;
            return failureCount < 2;
        }
    });

    // Create request
    const useCreateRequest = () => useMutation({
        mutationFn: async (formData) => {
            const res = await api.post('/requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
        }
    });

    // Get admin requests
    const useAllRequests = (filters = {}) => useQuery({
        queryKey: ['all-requests', filters],
        queryFn: async () => {
            const res = await api.get('/admin/requests', { params: filters });
            return res.data;
        }
    });

    // Get analytics
    const useAnalytics = (options = {}) => useQuery({
        queryKey: ['analytics'],
        queryFn: async () => {
            const res = await api.get('/admin/analytics');
            return res.data;
        },
        ...options
    });

    // Get comments
    const useComments = (ticketId) => useQuery({
        queryKey: ['comments', ticketId],
        queryFn: async () => {
            const res = await api.get(`/comments/${ticketId}`);
            return res.data;
        },
        enabled: !!ticketId
    });

    // Get technician tickets
    const useTechnicianTickets = (options = {}) => useQuery({
        queryKey: ['technician-tickets'],
        queryFn: async () => {
            const res = await api.get('/admin/technician/tickets');
            return res.data;
        },
        ...options
    });

    // Get ticket activity
    const useTicketActivity = (ticketId) => useQuery({
        queryKey: ['activity', ticketId],
        queryFn: async () => {
            const res = await api.get(`/admin/requests/${ticketId}/activity`);
            return res.data;
        },
        enabled: !!ticketId
    });

    // Get categories
    const useCategories = (options = {}) => useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        },
        ...options
    });

    // Add comment
    const useAddComment = () => useMutation({
        mutationFn: async (commentData) => {
            const res = await api.post('/comments', commentData);
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['comments', variables.ticketId] });
            queryClient.invalidateQueries({ queryKey: ['activity', variables.ticketId] });
        }
    });

    // Update status (Admin)
    const useUpdateStatus = () => useMutation({
        mutationFn: async ({ id, statusData }) => {
            const res = await api.put(`/admin/requests/${id}`, statusData);
            return res.data;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['request', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['all-requests'] });
        }
    });

    // Delete request (Admin)
    const useDeleteRequest = () => useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/admin/requests/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-requests'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        }
    });

    // Get all users (Admin)
    const useUsers = (options = {}) => useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/admin/users');
            return res.data;
        },
        ...options
    });

    return {
        useMyRequests,
        useRequest,
        useCreateRequest,
        useAllRequests,
        useAnalytics,
        useComments,
        useAddComment,
        useUpdateStatus,
        useDeleteRequest,
        useTechnicianTickets,
        useTicketActivity,
        useCategories,
        useUsers
    };
};

export default useRequests;
