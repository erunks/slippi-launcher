/** @jsx jsx */
import { IsoValidity } from "@common/types";
import { css, jsx } from "@emotion/react";
import styled from "@emotion/styled";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import Help from "@material-ui/icons/Help";
import React from "react";

import { PathInput } from "@/components/PathInput";
import { useDolphinStore } from "@/lib/hooks/useDolphin";
import { useIsoVerification } from "@/lib/hooks/useIsoVerification";
import { useIsoPath, useLaunchMeleeOnPlay } from "@/lib/hooks/useSettings";

import { SettingItem } from "./SettingItem";

const renderValidityStatus = (isoValidity: IsoValidity) => {
  switch (isoValidity) {
    case IsoValidity.VALID: {
      return <CheckCircleIcon />;
    }
    case IsoValidity.UNKNOWN: {
      return <Help />;
    }
    case IsoValidity.INVALID:
    case IsoValidity.UNVALIDATED: {
      return <ErrorIcon />;
    }
  }
};

export const MeleeOptions: React.FC = () => {
  const verifying = useIsoVerification((state) => state.isValidating);
  const isoValidity = useIsoVerification((state) => state.validity);
  const [isoPath, setIsoPath] = useIsoPath();
  const [launchMeleeOnPlay, setLaunchMelee] = useLaunchMeleeOnPlay();
  const netplayDolphinOpen = useDolphinStore((store) => store.netplayDolphinOpen);
  const playbackDolphinOpen = useDolphinStore((store) => store.playbackDolphinOpen);

  const onLaunchMeleeChange = async (value: string) => {
    const launchMelee = value === "true";
    await setLaunchMelee(launchMelee);
  };

  return (
    <div>
      <SettingItem name="Melee ISO File" description="The path to an NTSC Melee 1.02 ISO.">
        <PathInput
          tooltipText={netplayDolphinOpen || playbackDolphinOpen ? "Close Dolphin to change this setting" : ""}
          value={isoPath !== null ? isoPath : ""}
          onSelect={setIsoPath}
          placeholder="No file set"
          disabled={verifying || netplayDolphinOpen || playbackDolphinOpen}
          options={{
            filters: [{ name: "Melee ISO", extensions: ["iso", "gcm", "gcz"] }],
          }}
          endAdornment={
            <ValidationContainer className={verifying ? undefined : isoValidity.toLowerCase()}>
              <span
                css={css`
                  text-transform: capitalize;
                  margin-right: 5px;
                  font-weight: 500;
                `}
              >
                {verifying ? "Verifying..." : isoValidity.toLowerCase()}
              </span>
              {verifying ? <CircularProgress size={25} color="inherit" /> : renderValidityStatus(isoValidity)}
            </ValidationContainer>
          }
        />
      </SettingItem>
      <SettingItem name="Play Button Action" description="Choose what happens when the Play button is pressed.">
        <RadioGroup value={launchMeleeOnPlay} onChange={(_event, value) => onLaunchMeleeChange(value)}>
          <FormControlLabel value={true} label="Launch Melee" control={<Radio />} />
          <FormControlLabel value={false} label="Launch Dolphin" control={<Radio />} />
        </RadioGroup>
      </SettingItem>
    </div>
  );
};

const ValidationContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: white;
  &.invalid {
    color: ${({ theme }) => theme.palette.error.main};
  }
  &.valid {
    color: ${({ theme }) => theme.palette.success.main};
  }
`;
