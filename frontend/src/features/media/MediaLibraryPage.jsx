import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import SearchBar from '../../components/common/SearchBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import { deleteMediaAsync, fetchMediaAsync } from './mediaSlice';
import { useSearch } from '../../hooks/useSearch';
import MediaUploadForm from './MediaUploadForm';
import useRBAC from '../../hooks/useRBAC';
import { useToast } from '../../hooks/useToast';

function MediaLibraryPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.media);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [previewError, setPreviewError] = useState(false);
  const { query, setQuery, filteredItems } = useSearch(items, ['filename', 'originalName']);
  const { canDeleteMedia } = useRBAC();
  const toast = useToast();

  const resolveMediaUrl = (url) => {
    if (!url) {
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = process.env.REACT_APP_API_URL || '';
    return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const openPreview = (media) => {
    setPreviewError(false);
    setPreviewMedia(media);
  };

  const handlePreviewLoadError = () => {
    setPreviewError(true);
    toast.error('This image file is missing. Re-upload it to preview again.');
  };

  useEffect(() => {
    dispatch(fetchMediaAsync({ page: 0, size: 20 }));
  }, [dispatch]);

  const handleDelete = async () => {
    const result = await dispatch(deleteMediaAsync(pendingDelete.id));
    if (deleteMediaAsync.fulfilled.match(result)) {
      toast.success('Media deleted successfully');
    } else {
      toast.error(result.payload || 'Unable to delete media');
    }
    setPendingDelete(null);
  };

  return (
    <div className="page-enter eventhub-page-stack">
      <div className="eventhub-page-header">
        <div>
          <h1 className="h3 mb-0">Media Library</h1>
          <p className="eventhub-page-lead">Upload reusable assets and manage the media attached to events and campaigns.</p>
        </div>
      </div>
      <div className="row g-4">
        <div className="col-lg-4"><MediaUploadForm /></div>
        <div className="col-lg-8 d-flex flex-column gap-3">
          <SearchBar value={query} onChange={setQuery} placeholder="Search media by filename" />
          {loading ? <LoadingSkeleton rows={4} /> : (
            <div className="row g-3 eventhub-media-grid">
              {filteredItems.length ? filteredItems.map((media) => (
                <div className="col-md-6" key={media.id}>
                  <div className="eventhub-card eventhub-media-card p-3 h-100 d-flex flex-column gap-2">
                    <h5>{media.originalName}</h5>
                    <p className="text-muted mb-2">{media.filename}</p>
                    <span className="eventhub-badge align-self-start mb-1">{media.mediaType}</span>
                    <div className="mt-auto d-flex gap-2 flex-wrap">
                      {media.mediaType === 'IMAGE' && (
                        <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => openPreview(media)}>View</button>
                      )}
                      {canDeleteMedia(media) && (
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setPendingDelete(media)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              )) : <div className="col-12"><div className="eventhub-empty-state">No records available</div></div>}
            </div>
          )}
        </div>
      </div>
      {previewMedia && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center eventhub-modal-backdrop" style={{ zIndex: 2100 }}>
          <div className="eventhub-card eventhub-modal eventhub-image-modal p-4">
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h2 className="h4 mb-1">{previewMedia.originalName}</h2>
                <p className="text-muted mb-0">Image preview</p>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPreviewMedia(null)}>Close</button>
            </div>
            <div className="eventhub-image-preview-frame mb-3">
              {previewError ? (
                <div className="eventhub-empty-state m-0">This image does not have a stored file yet. Re-upload it to restore preview.</div>
              ) : (
                <img
                  src={resolveMediaUrl(previewMedia.url)}
                  alt={previewMedia.originalName}
                  className="eventhub-image-preview"
                  onError={handlePreviewLoadError}
                />
              )}
            </div>
            {!previewError && (
              <div className="d-flex justify-content-end gap-2 flex-wrap">
                <button type="button" className="btn btn-outline-secondary" onClick={() => window.open(resolveMediaUrl(previewMedia.url), '_blank', 'noopener,noreferrer')}>Open in new tab</button>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmModal show={Boolean(pendingDelete)} title="Delete media" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} />
    </div>
  );
}

export default MediaLibraryPage;
