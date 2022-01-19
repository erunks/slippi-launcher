/** @jsx jsx */
import { css, jsx } from "@emotion/react";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import React from "react";

export const Table: React.FC = (props) => {
  return (
    <Paper component="table" style={{ borderCollapse: "collapse" }}>
      {props.children}
    </Paper>
  );
};

export const TableHeaderCell = styled.td`
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-style: none solid;
  background-color: rgba(255, 255, 255, 0.2);
  height: 40px;
  text-align: left;
  padding-left: 12px;
  font-size: 18px;
`;

export const TableSubHeaderCell = styled.td`
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-style: none solid;
  background-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  height: 25px;
  font-size: 14px;
  font-weight: 500;
  padding: 5px 10px;
`;

export const TableCell = styled.td<{
  highlight?: boolean;
}>`
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-style: none solid;
  color: rgba(255, 255, 255, 0.6);
  padding: 10px;
  font-size: 16px;
  ${(props) =>
    props.highlight &&
    css`
      font-weight: 500;
      color: #ffe21f;
    `};
`;

export const TableRow = styled.tr`
  &:nth-of-type(even) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

export interface TableSectionProps {
  headerTitle: string;
  columnCount: number;
  children: React.ReactNode;
}

export const TableSection: React.FC<TableSectionProps> = ({ headerTitle, columnCount, children }) => {
  const lowercaseHeader = headerTitle.toLowerCase();

  return (
    <React.Fragment>
      <thead key={`${lowercaseHeader}-header`}>
        <tr>
          <TableSubHeaderCell colSpan={columnCount}>{headerTitle}</TableSubHeaderCell>
        </tr>
      </thead>
      <tbody key={`${lowercaseHeader}-body`}>{children}</tbody>
    </React.Fragment>
  );
};

interface GrayableImageProps {
  gray?: boolean;
}
export const GrayableImage = styled.img`
  ${(props: GrayableImageProps) =>
    props.gray &&
    css`
      opacity: 0.4;
    `}
`;
