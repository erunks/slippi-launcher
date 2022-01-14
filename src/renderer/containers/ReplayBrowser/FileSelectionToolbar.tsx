/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import styled from "@emotion/styled";
import { useAccount } from "@/lib/hooks/useAccount";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import BlockIcon from "@material-ui/icons/Block";
import DeleteIcon from "@material-ui/icons/Delete";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SelectAllIcon from "@material-ui/icons/SelectAll";
import React from "react";

import { ConfirmationModal } from "@/components/ConfirmationModal";

export interface FileSelectionToolbarProps {
  totalSelected: number;
  onAnalyze: () => void;
  onSelectAll: () => void;
  onPlay: () => void;
  onClear: () => void;
  onDelete: () => void;
}

export const FileSelectionToolbar: React.FC<FileSelectionToolbarProps> = ({
  totalSelected,
  onAnalyze,
  onSelectAll,
  onPlay,
  onClear,
  onDelete,
}) => {
  const [showDeletePrompt, setShowDeletePrompt] = React.useState(false);
  const currentUser = useAccount((store) => store.user);
  const playKey = useAccount((store) => store.playKey);
  const userIsLoggedIn = currentUser && playKey;

  const AnalyzeAllButton = (
    <Button
      disabled={!userIsLoggedIn}
      color="primary"
      variant="contained"
      size="small"
      onClick={onAnalyze}
      startIcon={<EqualizerIcon />}
    >
      Analyze All
    </Button>
  );
  const renderAnalyzeAllButton = userIsLoggedIn ? (
    AnalyzeAllButton
  ) : (
    <Tooltip title="Login to analyze all selected replays" placement="top">
      <span>{AnalyzeAllButton}</span>
    </Tooltip>
  );

  if (totalSelected === 0) {
    return null;
  }

  return (
    <Outer>
      <div
        css={css`
          display: flex;
          flex: 1;
          align-items: flex-end;
          justify-content: space-between;
          padding: 10px;
          button {
            margin-left: 10px;
          }
        `}
      >
        <div
          css={css`
            margin-left: 10px;
          `}
        >
          {totalSelected} files selected
        </div>
        <div>
          <Button
            color="secondary"
            variant="contained"
            size="small"
            onClick={() => setShowDeletePrompt(true)}
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
          <Button color="secondary" variant="contained" size="small" onClick={onClear} startIcon={<BlockIcon />}>
            Clear
          </Button>
          <Button
            color="secondary"
            variant="contained"
            size="small"
            onClick={onSelectAll}
            startIcon={<SelectAllIcon />}
          >
            Select All
          </Button>
          {renderAnalyzeAllButton}
          <Button color="primary" variant="contained" size="small" onClick={onPlay} startIcon={<PlayArrowIcon />}>
            Play All
          </Button>
        </div>
      </div>
      <ConfirmationModal
        open={showDeletePrompt}
        title="Confirm File Deletion"
        confirmText="Delete"
        onClose={() => setShowDeletePrompt(false)}
        onSubmit={onDelete}
      >
        {totalSelected} file(s) will be deleted.
      </ConfirmationModal>
    </Outer>
  );
};

const Outer = styled.div`
  position: absolute;
  bottom: 0px;
  right: 0px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 0));
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;
