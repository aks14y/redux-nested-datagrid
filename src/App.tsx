import {
  DataGridPro,
  useGridApiRef,
  GridColDef,
  GridCell,
  GridEditInputCell,
  GridTreeDataGroupingCell,
  useGridApiContext,
  GridRenderCellParams,
  GridGroupingColDefOverride,
  GridToolbarQuickFilter,
  GridGroupNode,
  useGridRootProps,
  DataGridProProps,
  getDataGridUtilityClass,
} from "@mui/x-data-grid-pro";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store/store";
import { useCallback, useEffect, useRef, useState } from "react";
import { setRows } from "./store/rowSlice";
import {
  Box,
  Button,
  IconButton,
  unstable_composeClasses,
} from "@mui/material";
import styled from "@emotion/styled";

type Item = {
  name?: string | null;
  contactFirstName?: string | null;
  contactLastName?: string | null;
  contactJobTitle?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  serviceEmail?: string | null;
  active?: boolean;
  displayName?: string | null;
  key?: string;
  parentOrganizationKey?: string;
  parentSiteKey?: string;
};

const StyledChevronWrapper = styled.div<{ depth: number }>`
  margin-left: calc(${(p) => p.depth}rem);
  cursor: grab;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
`;

const App = () => {
  const hierarchyLoading = useRef(true);
  const apiRef = useGridApiRef();
  const dispatch = useDispatch();
  const rowData = useSelector((state: RootState) => state.rowSlice.rows);

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "name",
      width: 180,
      headerClassName: "super-app-theme--header",
      flex: 1,
      minWidth: 100,
    },
    {
      field: "contact",
      headerName: "contact",
      width: 150,
      headerClassName: "super-app-theme--header",
      flex: 1,
      minWidth: 100,
    },
  ];

  const getRowById = (rows: Item[], id: string): Item | undefined => {
    return rows.find((row) => row.key === id);
  };

  const getParentIds = (rows: Item[], row: Item): string[] => {
    const parent = getRowById(
      rows,
      row.parentOrganizationKey ?? row.parentSiteKey
    );

    if (!parent) {
      return [];
    }

    if (!parent.parentOrganizationKey && !parent.parentSiteKey) {
      return [parent.key];
    }

    const parentIds = getParentIds(rows, parent);

    return [...parentIds, parent.key];
  };

  const useUtilityClasses = (ownerState: {
    classes: DataGridProProps["classes"];
  }) => {
    const { classes } = ownerState;

    const slots = {
      root: ["treeDataGroupingCell"],
      toggle: ["treeDataGroupingCellToggle"],
    };

    return unstable_composeClasses(slots, getDataGridUtilityClass, classes);
  };

  const GroupingCellWithLazyLoading = (props: any) => {
    const { id, rowNode, row } = props;
    const rootProps = useGridRootProps();
    const apiRef = useGridApiContext();
    const classes = useUtilityClasses({ classes: rootProps.classes });

    const Icon: any = rowNode.childrenExpanded
      ? rootProps.slots.treeDataCollapseIcon
      : rootProps.slots.treeDataExpandIcon;

    const handleClick = (key) => {
      const newSubOrg = {
        key: "6f131a7c-d5c7-4e66-04b2-08db10b71a12", // this is the key of of the existing child inside kalkitech org
        parentOrganizationKey: key,
        displayName: "New expanded", // kalkitech 7773 is the actual name of the object which will be updated when hierarchy data overrides
        contactFirstName: "string",
        contactLastName: "string",
        contactPhone: "string",
        contactEmail: "string",
        contactJobTitle: "string",
        serviceEmail: "string",
      };
      const currRows = apiRef.current.getRowModels().values();
      console.log(Array.from(currRows), "Current rows after loading");
      if (hierarchyLoading.current) {
        apiRef.current.updateRows([newSubOrg]);
      }
      setTimeout(() => {
        apiRef.current.setRowChildrenExpansion(key, !rowNode.childrenExpanded);
      }, 4000);
    };

    return (
      <StyledChevronWrapper depth={rowNode.depth}>
        <Box className={classes.toggle}>
          <IconButton
            size="small"
            data-testid={`chevron-icon-${row.key}`}
            onClick={() => handleClick(row.key)}
            tabIndex={-1}
            aria-label={
              rowNode?.childrenExpanded
                ? apiRef.current.getLocaleText("treeDataCollapse")
                : apiRef.current.getLocaleText("treeDataExpand")
            }
          >
            <Icon fontSize="inherit" />
          </IconButton>
          {row.displayName ?? row.name}
          {rowNode?.children ? `  (${rowNode?.children?.length})` : ""}
        </Box>
      </StyledChevronWrapper>
    );
  };

  interface GroupingCellWithLazyLoadingProps
    extends GridRenderCellParams<any, any, any, GridGroupNode> {}

  const GROUPING_COL_DEF: GridGroupingColDefOverride<Item> = {
    flex: 0.1,
    minWidth: 200,
    renderHeader: () => {
      return "";
    },
    valueGetter: (params) => {
      return params.row.displayName || params.row.name;
    },
    renderCell: (params) => (
      <GroupingCellWithLazyLoading
        {...(params as GroupingCellWithLazyLoadingProps)}
      />
    ),
  };

  const QuickSearchToolbar = () => {
    return (
      <>
        <GridToolbarQuickFilter
          placeholder="Search"
          variant={"outlined" as "filled"}
          fullWidth
        />
        <Box>
          <Button onClick={handleOnAddClick}>Add</Button>
          <Button onClick={handleOnRemoveClick}>Remove</Button>
        </Box>
      </>
    );
  };

  const handleOnAddClick = () => {
    const newSubOrg = {
      key: "80bf259f-d291-438d-d05d-08dac932fe3k",
      parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
      displayName: "Boom",
      contactFirstName: "string",
      contactLastName: "string",
      contactPhone: "string",
      contactEmail: "string",
      contactJobTitle: "string",
      serviceEmail: "string",
    };
    // updating store causes table re render
    // dispatch(setRows([newSubOrg]));
    // apiRef is only way to update treedata datgrid without causing a table re render, check this thread https://github.com/mui/mui-x/issues/7771#issuecomment-1411818662
    apiRef.current.updateRows([newSubOrg]);
  };

  const handleOnRemoveClick = () => {
    //trying to delete the first sub org with key "683fdede-8249-48e6-3275-08dace1410ba" under kalkitech
    apiRef.current.updateRows([
      { key: "683fdede-8249-48e6-3275-08dace1410ba", _action: "delete" },
    ]);
  };

  const getTreeDataPath = (rows: Item[], row: Item) => [
    ...getParentIds(rows, row),
    row.key,
  ];

  function groupObjectsByParentKey(objects) {
    // Create an object to store the hierarchy
    const hierarchy = {};

    // Iterate through the objects
    objects.forEach((obj) => {
      const key = obj.key;
      const parentKey = obj.parentOrganizationKey || obj.siteKey;
      obj.children = [];
      // If the object has a parentKey
      try {
        if (parentKey) {
          // Create a parent if it doesn't exist
          if (!hierarchy[parentKey]) {
            console.log("SDSD");
            hierarchy[parentKey] = {
              children: [],
            };
          }

          // Add the object to its parent's children
          hierarchy[parentKey].children.push(obj);
        } else {
          // If it doesn't have a parentKey, add it directly to the hierarchy
          hierarchy[key] = obj;
          console.log(hierarchy);
        }
      } catch (error) {
        console.log(error, obj, hierarchy);
      }
    });

    // Convert the hierarchy object back to an array
    const groupedObjects = Object.values(hierarchy);

    return groupedObjects;
  }

  function topologicalSort(objects) {
    const visited = {};
    const result = [];

    function visit(obj) {
      const key = obj.key;

      if (!visited[key]) {
        visited[key] = true;

        // Check both parent keys
        const parentKey = obj.parentOrganizationKey || obj.siteKey;

        if (parentKey) {
          const parentObj = objects.find((o) => o.key === parentKey);
          if (parentObj) {
            visit(parentObj);
          }
        }

        result.push(obj);
      }
    }

    objects.forEach((obj) => {
      visit(obj);
    });

    return result;
  }

  const flattenHierarchy = (hierarchy: Object) => {
    // Usage
    const items = Object.values(hierarchy).flat();
    console.log(items);
    const groupedData = topologicalSort(items);
    return groupedData;
  };

  useEffect(() => {
    const data = {
      organization: {
        name: "Kalki",
        contactFirstName: "Habeeb",
        contactLastName: "Asif",
        contactJobTitle: "Developer",
        contactPhone: "9832176540",
        contactEmail: "muhad@gmail.com",
        serviceEmail: "",
        active: true,
        displayName: "Kalkitech",
        key: "d6415e59-443d-4613-ab93-08dac174f88f",
      },
      childOrganizations: [
        {
          key: "80bf259f-d291-438d-d05d-08dac932fe3e",
          parentOrganizationKey: "ca5ae899-b7f6-4d31-fa6f-08dac3af355c",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "67a179b2-15b0-4437-d05e-08dac932fe3e",
          parentOrganizationKey: "ca5ae899-b7f6-4d31-fa6f-08dac3af355c",
          displayName: "Sub Sub 1",
          contactFirstName: "Amal",
          contactLastName: "Saiju",
          contactPhone: "78797976",
          contactEmail: "amal@kalki.com",
          contactJobTitle: "SDE",
          serviceEmail: "as@kalki.com",
        },
        {
          key: "0c645c42-09c5-4b97-d05f-08dac932fe3e",
          parentOrganizationKey: "ca5ae899-b7f6-4d31-fa6f-08dac3af355c",
          displayName: "Sub Sub 4",
          contactFirstName: "Don",
          contactLastName: "Jolly",
          contactPhone: "982363273",
          contactEmail: "don@kalki.com",
          contactJobTitle: "SDE",
          serviceEmail: "dj@kalki.com",
        },
        {
          key: "01efd137-5b98-4c72-328f-08dac9334f5f",
          parentOrganizationKey: "ca5ae899-b7f6-4d31-fa6f-08dac3af355c",
          displayName: "Sub Sub 2",
          contactFirstName: "Asif",
          contactLastName: "Habeeb",
          contactPhone: "2345436",
          contactEmail: "asif@kalki.com",
          contactJobTitle: "SDE",
          serviceEmail: "as@kalki.com",
        },
        {
          key: "2dfc3d1a-1e0c-43ff-3290-08dac9334f5f",
          parentOrganizationKey: "ca5ae899-b7f6-4d31-fa6f-08dac3af355c",
          displayName: "Sub Sub 3",
          contactFirstName: "Aneesh",
          contactLastName: "Kumar",
          contactPhone: "364653463",
          contactEmail: "aneesh@kalki.com",
          contactJobTitle: "SDE",
          serviceEmail: "ak@kalki.com",
        },
        {
          key: "bad8c310-c646-4735-3291-08dac9334f5f",
          parentOrganizationKey: "ca5ae899-b7f6-4d31-fa6f-08dac3af355c",
          displayName: "Sub Sub 5",
          contactFirstName: "Akshay",
          contactLastName: "Vava",
          contactPhone: "369897463",
          contactEmail: "akshay@kalki.com",
          contactJobTitle: "SDE",
          serviceEmail: "av@kalki.com",
        },
        {
          key: "67d96f44-18c4-401d-96be-08dacd834db5",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Kalkitech",
          contactFirstName: "Alananon",
          contactLastName: "Saiju",
          contactPhone: "912345678111",
          contactEmail: "amal@1233",
          contactJobTitle: "Manager",
          serviceEmail: "frfrfrfr",
        },
        {
          key: "683fdede-8249-48e6-3275-08dace1410ba",
          parentOrganizationKey: "67d96f44-18c4-401d-96be-08dacd834db5",
          displayName: "string",
          contactFirstName: "stringstringstringstringstringstringstring",
          contactLastName: "stringstringstringstringstringstringstringstring",
          contactPhone: "46346346",
          contactEmail: "stringstringstringstringstringstring@gmail.com",
          contactJobTitle: "stringstringstringstringstringstring",
          serviceEmail: "string",
        },
        {
          key: "6198d60c-3c55-4832-3277-08dace1410ba",
          parentOrganizationKey: "1a8593ab-145f-4629-0283-08dac6556eeb",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "4efaa9f1-b299-46ff-52cf-08dace07391a",
          parentOrganizationKey: "1a8593ab-145f-4629-0283-08dac6556eeb",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "a98cef09-20ff-44bd-80ee-08dad2d4bb73",
          parentOrganizationKey: "d67542eb-296d-4191-0944-08dad2d4b096",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "a28eb7ab-88d0-4250-a92f-08dad3805948",
          parentOrganizationKey: "824eeb8b-c1cb-4f2d-c8f1-08dad354715a",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "4366e1a5-7935-4ffe-c8f2-08dad354715a",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "139abba8-7682-4705-4cd6-08dadef9091f",
          parentOrganizationKey: "d5840a69-a2e4-4175-cf4c-08dadf28d378",
          displayName: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Kalkitech 7773",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "4e1223b0-83ce-4dee-96c1-08db298d78ac",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Eric - Please do not mod",
          contactFirstName: "Eric",
          contactLastName: "Cornwell",
          contactPhone: "string",
          contactEmail: "esc01@acuitybrands.com",
          contactJobTitle: "Undefined",
          serviceEmail: "Undefined",
        },
        {
          key: "3f13de82-9e8b-47f3-749a-08db2b5900e9",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Asif Habeeb org",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "1036bc17-f391-463b-749b-08db2b5900e9",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "string1234",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "5746e299-6616-4756-08cc-08db2c3b129e",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          displayName: "Habbeb Asif",
          contactFirstName: "Albin",
          contactLastName: "jiji",
          contactPhone: "8765432112",
          contactEmail: "albin@gmail.com",
          contactJobTitle: "Enginnerr",
          serviceEmail: "string",
        },
        {
          key: "21bee1d2-a839-4875-08cd-08db2c3b129e",
          parentOrganizationKey: "d9115606-2745-4aad-769f-08db2c3bba5d",
          displayName: "anouska",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "1981453c-2a90-4ff2-08ce-08db2c3b129e",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Test SQA org33",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "5a0fa23d-4c96-47d8-08cf-08db2c3b129e",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          displayName: "Test SQA org",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "af7ed227-06da-4170-7699-08db2c3bba5d",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          displayName: "Jiji Albin",
          contactFirstName: "jiji",
          contactLastName: "Albin",
          contactPhone: "(555) 555-1234",
          contactEmail: "albin@gmail.com",
          contactJobTitle: "dev",
          serviceEmail: "string",
        },
        {
          key: "77867945-8f37-49c8-769a-08db2c3bba5d",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          displayName: "KM Maria",
          contactFirstName: "Mariaaaaa",
          contactLastName: "K M",
          contactPhone: "987654321",
          contactEmail: "maria@543",
          contactJobTitle: "Tester",
          serviceEmail: "string",
        },
        {
          key: "01741d72-74f2-4818-769b-08db2c3bba5d",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          displayName: "Habeeb Asif",
          contactFirstName: "Asif",
          contactLastName: "Habeeb",
          contactPhone: "9873212134",
          contactEmail: "asif@gmail.com",
          contactJobTitle: "Develop",
          serviceEmail: "string",
        },
        {
          key: "21eea88a-161a-4c09-769d-08db2c3bba5d",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "string5678",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "09e051b5-bd3c-4918-769e-08db2c3bba5d",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "string222222223",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "d9115606-2745-4aad-769f-08db2c3bba5d",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "srvrv20929999",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "b0633e4a-45d6-4214-76a0-08db2c3bba5d",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Maria -SQA",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "5562df3e-bf2d-486d-76a1-08db2c3bba5d",
          parentOrganizationKey: "b0633e4a-45d6-4214-76a0-08db2c3bba5d",
          displayName: "Maria -SQA Sub org 22",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "de18f95b-9e22-4b35-0b13-08db3148e114",
          parentOrganizationKey: "1981453c-2a90-4ff2-08ce-08db2c3b129e",
          displayName: "TEST SAMPLE QA",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "bdc3743c-61f6-44bc-0b14-08db3148e114",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "ORG - Priya Jude",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "4c3177c5-e450-41df-0b16-08db3148e114",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          displayName: "SUBORG - AMAL",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "19922579-cd7b-4377-0b17-08db3148e114",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "SUB ORG- AMAL",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "128103e1-f888-449c-1bec-08db319ee786",
          parentOrganizationKey: "1981453c-2a90-4ff2-08ce-08db2c3b129e",
          displayName: "TEST SQA",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "46d085a2-57b7-4340-1bee-08db319ee786",
          parentOrganizationKey: "3f13de82-9e8b-47f3-749a-08db2b5900e9",
          displayName: "TEST SAMPLE QA",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "09d46364-8ca6-4c4a-1bef-08db319ee786",
          parentOrganizationKey: "19922579-cd7b-4377-0b17-08db3148e114",
          displayName: "SUBORG - AMAL",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "d9d7fd96-d36b-458f-526d-08db3f47db3b",
          parentOrganizationKey: "d9115606-2745-4aad-769f-08db2c3bba5d",
          displayName: "Abhishek Sub org",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "81564b6a-b121-4398-b763-08db4e1cfd38",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Org Amplify2",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "c24e6dfb-2795-4103-b765-08db4e1cfd38",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Kalki 11 Sub Org",
          contactFirstName: "Maria",
          contactLastName: "Mattappally",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "0fbf7e8a-09b7-43c4-b6df-08db55608ec1",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "new suborg",
          contactFirstName: "Akshay",
          contactLastName: "Ajith",
          contactPhone: "9876543210",
          contactEmail: "akshay.ajith@kalki.com",
          contactJobTitle: "dev",
          serviceEmail: "akshay.ajith@kalki.com",
        },
        {
          key: "0e1313fb-5119-46f6-2fad-08db5b8b2fd7",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "dfdvf",
          contactFirstName: "testsite",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "Undefined",
          serviceEmail: "Undefined",
        },
        {
          key: "8661efe9-68f4-42c1-8e0a-08db6354e684",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "TESTBUG",
          contactFirstName: "bug",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "c9c56681-29cd-4026-e7f5-08db6b4520fe",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "TTTTTTTTTTTTTT",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "01fd54f9-4dd8-45b7-4e7e-08db6bb8d137",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "TTTTTTTTTTTTTT",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          contactJobTitle: "string",
          serviceEmail: "string",
        },
        {
          key: "e0efd57c-d618-4efc-225e-08db8fa24663",
          parentOrganizationKey: "1036bc17-f391-463b-749b-08db2b5900e9",
          displayName: "dfdsfds",
          contactFirstName: "123",
          contactLastName: "213",
          contactPhone: "9876542312",
          contactEmail: "ddsad@org.com",
          contactJobTitle: "123",
          serviceEmail: "ddsad@org.com",
        },
        {
          key: "e09f7c8a-e5f5-4e69-2260-08db8fa24663",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "erlse",
          contactFirstName: "dsfd",
          contactLastName: "fds",
          contactPhone: "9876543210",
          contactEmail: "dfsd@gmail.com",
          contactJobTitle: "fdsf",
          serviceEmail: "dfsd@gmail.com",
        },
        {
          key: "212613fc-78c6-494d-b350-08dbb2b50b6d",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Megha Sunil",
          contactFirstName: "Megha",
          contactLastName: "Sunil",
          contactPhone: "7878627627",
          contactEmail: "mzs09@acuitysso.com",
          contactJobTitle: "Tester",
          serviceEmail: "mzs09@acuitysso.com",
        },
        {
          key: "59fdebe7-5357-4282-f95d-08dbb8d1cd0d",
          parentOrganizationKey: "e70ee0d3-61dd-4ee8-b106-08dbb8d3bb14",
          displayName: "New Sub Sub Org",
          contactFirstName: "Albin",
          contactLastName: "Jiji",
          contactPhone: "456547547",
          contactEmail: "aj@jj.com",
          contactJobTitle: "Engineer",
          serviceEmail: "aj@jj.com",
        },
        {
          key: "e70ee0d3-61dd-4ee8-b106-08dbb8d3bb14",
          parentOrganizationKey: "00000000-0000-0000-0300-000000000000",
          displayName: "New SubOrg Kalki",
          contactFirstName: "Albin",
          contactLastName: "Jiji",
          contactPhone: "53454363",
          contactEmail: "aj@hhm.com",
          contactJobTitle: "Engineer",
          serviceEmail: "aj@hhm.com",
        },
        {
          key: "00000000-0000-0000-0300-000000000000",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Usable Kalkitech org",
          contactFirstName: "Generated contact first name",
          contactLastName: "Generated contact last name",
          contactPhone: "Generated contact phone number",
          contactEmail: "Generated contact email",
          contactJobTitle: "Generated contact job title",
          serviceEmail: "Generated service email",
        },
        {
          key: "00000000-0000-0000-2d00-000000000000",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          displayName: "Kalki 11 SubOrg",
          contactFirstName: "Maria",
          contactLastName: "Mattappally",
          contactPhone: "Generated contact phone number",
          contactEmail: "Generated contact email",
          contactJobTitle: "Generated contact job title",
          serviceEmail: "Generated service email",
        },
      ],
      childSites: [
        {
          key: "ac87f494-823f-4c49-b498-08dac8db5b4d",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          parentSiteKey: "32d026b3-9476-4515-c858-08dac3236e39",
          name: "string",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "d6ddac6b-5914-4909-564c-08dacb0ca857",
          parentOrganizationKey: null,
          parentSiteKey: "759e9207-d9f3-48a4-f328-08dac9284bf5",
          name: "Sub Site 2",
          contactFirstName: "Aneesh",
          contactLastName: "Kumar",
          contactPhone: "323423",
          contactEmail: "aneesh@kalki.com",
          location: "Ekm, Kerala 673603, India",
        },
        {
          key: "ca6a8276-d4c6-4de1-564d-08dacb0ca857",
          parentOrganizationKey: null,
          parentSiteKey: "759e9207-d9f3-48a4-f328-08dac9284bf5",
          name: "Sub Site 3",
          contactFirstName: "Albin",
          contactLastName: "Jiji",
          contactPhone: "46576579",
          contactEmail: "albin@kalki.com",
          location: "Ekm, Kerala 673553, India",
        },
        {
          key: "88c8a67c-e156-47a2-87a2-08dac995a2b1",
          parentOrganizationKey: null,
          parentSiteKey: "759e9207-d9f3-48a4-f328-08dac9284bf5",
          name: "SubSite 1",
          contactFirstName: "Asif",
          contactLastName: "Habeeb",
          contactPhone: "636546",
          contactEmail: "asif@kalki.com",
          location: "Ekm, Kerala 433434, India",
        },
        {
          key: "68ddad09-0e75-4a45-87a3-08dac995a2b1",
          parentOrganizationKey: null,
          parentSiteKey: "759e9207-d9f3-48a4-f328-08dac9284bf5",
          name: "Sub Site 4",
          contactFirstName: "Akshay",
          contactLastName: "Vava",
          contactPhone: "868889",
          contactEmail: "vava@kalki.com",
          location: "Ekm, Kerala 673583, India",
        },
        {
          key: "855932b1-e115-43e7-ea63-08dad312a0b5",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          parentSiteKey: null,
          name: "Acuity sub org 1111111111111",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "31e0cf90-db01-4dd4-ea64-08dad312a0b5",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          parentSiteKey: null,
          name: "Acuity sub org acuity",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "54b5933d-dbb3-41cd-68e8-08dad39d7a00",
          parentOrganizationKey: "824eeb8b-c1cb-4f2d-c8f1-08dad354715a",
          parentSiteKey: null,
          name: "dellaaa sub org 333",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "bd074098-cc87-47a4-68e9-08dad39d7a00",
          parentOrganizationKey: "824eeb8b-c1cb-4f2d-c8f1-08dad354715a",
          parentSiteKey: null,
          name: "dellaaa sub org 333",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "28661d22-eac5-4c34-68ea-08dad39d7a00",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          parentSiteKey: null,
          name: "Acuity sub org 333",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "18d1ec4e-b842-4069-1a9a-08dadf87beda",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          parentSiteKey: null,
          name: "Site123456787654334634234",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "88747207-9ee7-40d9-1aa7-08dadf87beda",
          parentOrganizationKey: "d5840a69-a2e4-4175-cf4c-08dadf28d378",
          parentSiteKey: null,
          name: "Site12",
          contactFirstName: "aaa",
          contactLastName: "ccc",
          contactPhone: "fff",
          contactEmail: "123421",
          location: "string, string string, string",
        },
        {
          key: "a3952290-cdc4-448e-1aa9-08dadf87beda",
          parentOrganizationKey: null,
          parentSiteKey: "88747207-9ee7-40d9-1aa7-08dadf87beda",
          name: "SubSite123",
          contactFirstName: "string",
          contactLastName: "aaa",
          contactPhone: "aaaa",
          contactEmail: "aaa",
          location: "string, string string, string",
        },
        {
          key: "de1ce284-1bac-4e85-1ab7-08dadf87beda",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          parentSiteKey: null,
          name: "Siteee1",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "0422eaea-2fd8-453b-6ddc-08dadfa51eae",
          parentOrganizationKey: null,
          parentSiteKey: "28661d22-eac5-4c34-68ea-08dad39d7a00",
          name: "Site423234",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "f9bc9635-8310-4443-6deb-08dadfa51eae",
          parentOrganizationKey: "48558e4c-eaa4-407d-52ca-08dace07391a",
          parentSiteKey: null,
          name: "Siteee",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "a834990d-23ec-494d-37d5-08db042f597a",
          parentOrganizationKey: null,
          parentSiteKey: "855932b1-e115-43e7-ea63-08dad312a0b5",
          name: "test",
          contactFirstName: "testname",
          contactLastName: "testlname",
          contactPhone: "123456789",
          contactEmail: "tt@kalki.com",
          location: "string, string string, string",
        },
        {
          key: "3216b3a9-f746-4bf8-fdf5-08db0cce3b83",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          parentSiteKey: "32d026b3-9476-4515-c858-08dac3236e39",
          name: "Site-Test-1",
          contactFirstName: "ABC",
          contactLastName: "ABC",
          contactPhone: "ABC",
          contactEmail: "2adaasdas@asdsa.ads",
          location: "ATL, GA 636707, USA",
        },
        {
          key: "633124ba-7b6b-4d8e-370c-08db2aecac79",
          parentOrganizationKey: "9634a747-890f-4510-cadc-08db2adbafeb",
          parentSiteKey: null,
          name: "Site - SQA",
          contactFirstName: "Kalki",
          contactLastName: "SQA",
          contactPhone: "1234567",
          contactEmail: "string",
          location: "string, string 123456, India",
        },
        {
          key: "480c43df-70ec-4bae-bd47-08db2aef166c",
          parentOrganizationKey: null,
          parentSiteKey: "633124ba-7b6b-4d8e-370c-08db2aecac79",
          name: "Subsite - QA",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "ea3a79ca-ad62-43f2-ab63-08db2c74e00d",
          parentOrganizationKey: "5562df3e-bf2d-486d-76a1-08db2c3bba5d",
          parentSiteKey: null,
          name: "Maria SQA - Site",
          contactFirstName: "Maria SQA -Site",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "d3d344d3-5c78-4cee-ab64-08db2c74e00d",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          parentSiteKey: null,
          name: "site 24",
          contactFirstName: "Akhil",
          contactLastName: "Chandran",
          contactPhone: "1222222222",
          contactEmail: "Akhil@123",
          location: "Georgia, kerala 3456211, India",
        },
        {
          key: "3bb5f111-d8c9-4946-ff28-08db2e87e259",
          parentOrganizationKey: "6f131a7c-d5c7-4e66-04b2-08db10b71a12",
          parentSiteKey: null,
          name: "Site 25",
          contactFirstName: "Razzen",
          contactLastName: "Rasheed",
          contactPhone: "01234567890",
          contactEmail: "Akhil@123",
          location: "strinkeralag, kerala 456783, India",
        },
        {
          key: "152a995b-8d3d-4bd3-871d-08db3f551e52",
          parentOrganizationKey: "1981453c-2a90-4ff2-08ce-08db2c3b129e",
          parentSiteKey: null,
          name: "MIS BUILDING RENOVATION",
          contactFirstName: "firstName",
          contactLastName: "lastName",
          contactPhone: "000-000-0000",
          contactEmail: "contact@website.com",
          location: "CONYERS, GA 00000, USA",
        },
        {
          key: "27fbc875-977d-471b-8493-08db476557b6",
          parentOrganizationKey: null,
          parentSiteKey: "a2925b46-c0fa-4d5c-8492-08db476557b6",
          name: "Maria -SQA Test sub site",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "cb40376b-4a7a-4176-80ab-08db4cd4b458",
          parentOrganizationKey: "81564b6a-b121-4398-b763-08db4e1cfd38",
          parentSiteKey: null,
          name: "Site Amplify 8",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "59cde6b0-3ed2-4f49-80ac-08db4cd4b458",
          parentOrganizationKey: "81564b6a-b121-4398-b763-08db4e1cfd38",
          parentSiteKey: null,
          name: "Site Amplify #2",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "177766e5-36dc-4c24-8fdf-08db4de3b2c9",
          parentOrganizationKey: "0a30d491-2efc-42c8-b764-08db4e1cfd38",
          parentSiteKey: null,
          name: "Site non trident",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "7184fb67-4602-46f7-ae7b-08db57a41975",
          parentOrganizationKey: null,
          parentSiteKey: "d3d344d3-5c78-4cee-ab64-08db2c74e00d",
          name: "sub site",
          contactFirstName: "Akshay",
          contactLastName: "Ajith",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "a4f8ca1b-5943-44fa-7c0e-08db5b8b606f",
          parentOrganizationKey: "0e1313fb-5119-46f6-2fad-08db5b8b2fd7",
          parentSiteKey: null,
          name: "TestSIteMOve",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "ba07ab52-3be4-4e28-20a0-08db5c87c87e",
          parentOrganizationKey: null,
          parentSiteKey: "d3d344d3-5c78-4cee-ab64-08db2c74e00d",
          name: "Sub Site 2",
          contactFirstName: "Akshay",
          contactLastName: "Ajith",
          contactPhone: "string",
          contactEmail: "akshay.ajith@kalkitech.com",
          location: "string, string string, India",
        },
        {
          key: "84011c31-56d9-4da2-6684-08db60279f06",
          parentOrganizationKey: null,
          parentSiteKey: "d3d344d3-5c78-4cee-ab64-08db2c74e00d",
          name: "Sub Site 3",
          contactFirstName: "Akshay",
          contactLastName: "Ajith",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, India",
        },
        {
          key: "ba9d0658-3d0d-49fa-b044-08db6b0018e0",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          parentSiteKey: "32d026b3-9476-4515-c858-08dac3236e39",
          name: "TEST SITE_PRIYA",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string string, string",
        },
        {
          key: "c061ba13-863d-44fe-7946-08db71d17b86",
          parentOrganizationKey: "01ded0cd-299a-4c35-e7e9-08db6b4520fe",
          parentSiteKey: null,
          name: "Testsite1",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "string, string 666666, USA",
        },
        {
          key: "9be125b2-35cf-4460-308f-08db8a269d17",
          parentOrganizationKey: "67d96f44-18c4-401d-96be-08dacd834db5",
          parentSiteKey: null,
          name: "Acuity Global",
          contactFirstName: "Alananon",
          contactLastName: "Saiju",
          contactPhone: "912345678111",
          contactEmail: "amal@1233",
          location: "1234, 235 35235, US",
        },
        {
          key: "9916d440-0daf-440e-3de2-08db8a26badb",
          parentOrganizationKey: "67d96f44-18c4-401d-96be-08dacd834db5",
          parentSiteKey: null,
          name: "Acuity Global",
          contactFirstName: "Alananon",
          contactLastName: "Saiju",
          contactPhone: "912345678111",
          contactEmail: "amal@1233",
          location: "123, 123 66666, US",
        },
        {
          key: "117dc2b6-96d4-4d82-3de3-08db8a26badb",
          parentOrganizationKey: "67d96f44-18c4-401d-96be-08dacd834db5",
          parentSiteKey: null,
          name: "Acuity Global",
          contactFirstName: "Alananon",
          contactLastName: "Saiju",
          contactPhone: "912345678111",
          contactEmail: "amal@1233",
          location: "1123, 124 22222, US",
        },
        {
          key: "e15fd7e2-35ff-4082-3de4-08db8a26badb",
          parentOrganizationKey: "67d96f44-18c4-401d-96be-08dacd834db5",
          parentSiteKey: null,
          name: "Acuity Global",
          contactFirstName: "Alananon",
          contactLastName: "Saiju",
          contactPhone: "912345678111",
          contactEmail: "amal@1233",
          location: "2345, 245 23523, US",
        },
        {
          key: "4660f5f7-c21e-4fc8-a8b6-08db8ed8d2a1",
          parentOrganizationKey: "77867945-8f37-49c8-769a-08db2c3bba5d",
          parentSiteKey: null,
          name: "Test site",
          contactFirstName: "Mariaaaaa",
          contactLastName: "K M",
          contactPhone: "987654321",
          contactEmail: "maria@543",
          location: "dsfdsf, dsfsd 32432, US",
        },
        {
          key: "94c51a4b-25bc-4218-271b-08db9f5609d1",
          parentOrganizationKey: "5562df3e-bf2d-486d-76a1-08db2c3bba5d",
          parentSiteKey: null,
          name: "Abhi",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "Bengaluru, Karnataka 12345, US",
        },
        {
          key: "1dde83b6-9029-4854-271c-08db9f5609d1",
          parentOrganizationKey: "5562df3e-bf2d-486d-76a1-08db2c3bba5d",
          parentSiteKey: null,
          name: "New",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "Bengaluru, Karnataka 12345, US",
        },
        {
          key: "b94645a1-f0ff-4171-271d-08db9f5609d1",
          parentOrganizationKey: "5562df3e-bf2d-486d-76a1-08db2c3bba5d",
          parentSiteKey: null,
          name: "Abc",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "Delhi, Goa 98765, US",
        },
        {
          key: "cd367be4-d8ab-44c0-8924-08dbafe714e2",
          parentOrganizationKey: "d6415e59-443d-4613-ab93-08dac174f88f",
          parentSiteKey: "32d026b3-9476-4515-c858-08dac3236e39",
          name: "Test 09/11",
          contactFirstName: "Habeeb",
          contactLastName: "Asif",
          contactPhone: "9832176540",
          contactEmail: "muhad@gmail.com",
          location: "test, test 30022, US",
        },
        {
          key: "cd8745e3-2f33-43da-32d3-08dbb89a9b88",
          parentOrganizationKey: "e70ee0d3-61dd-4ee8-b106-08dbb8d3bb14",
          parentSiteKey: null,
          name: "New site 2",
          contactFirstName: "Albin",
          contactLastName: "Jiji",
          contactPhone: "53454363",
          contactEmail: "aj@hhm.com",
          location: "Aluva, Kerala 67360, US",
        },
        {
          key: "76d7a8e0-4e26-4c03-47de-08dbb8d2cf7a",
          parentOrganizationKey: null,
          parentSiteKey: "ac87f494-823f-4c49-b498-08dac8db5b4d",
          name: "fkvbjkev",
          contactFirstName: "string",
          contactLastName: "string",
          contactPhone: "string",
          contactEmail: "string",
          location: "rve, erv 34343, US",
        },
        {
          key: "45aa3abb-6dd2-4a65-47df-08dbb8d2cf7a",
          parentOrganizationKey: "59fdebe7-5357-4282-f95d-08dbb8d1cd0d",
          parentSiteKey: null,
          name: "New Site",
          contactFirstName: "Albin",
          contactLastName: "Jiji",
          contactPhone: "456547547",
          contactEmail: "aj@jj.com",
          location: "Aluva, Kerala 24356, US",
        },
      ],
    };
    const rows = flattenHierarchy(data);

    // trying to lazy load with only a single row provided initially
    dispatch(setRows([rows[0]]));

    // this case works fine all the data is provided before hand
    //  dispatch(setRows(rows));

    setTimeout(() => {
      // using timeout to feed the rem. data
      apiRef.current.updateRows(rows);

      hierarchyLoading.current = false;
    }, 8000);

    // hierarchyLoading.current = false;
  }, []);

  const getTreeDataPath1: any = (row) => {
    let rowPath;
    const currRows = apiRef.current.getRowModels().values();
    const currRowsArray = Array.from(currRows);
    console.log(Array.from(currRows), "Current rows");

    // this currRowsArray has to hold the entire table data for it be placed under the parent rows, Which is not happening at the moment
    // the rows updated using apiRef.current does not show up currRowsArray. May be beacuse this is row confined step. It only gets you current row data.
    rowPath = getTreeDataPath(currRowsArray, row);
    console.log(rowPath);
    return rowPath;
  };

  // const getTreeDataPath1: DataGridProProps["getTreeDataPath"] = (row) =>
  //   getTreeDataPath(Array.from(apiRef.current.getRowModels().values()), row);

  return (
    <div>
      <DataGridPro
        loading={!rowData}
        columns={columns}
        rows={rowData}
        groupingColDef={GROUPING_COL_DEF}
        treeData
        apiRef={apiRef}
        getTreeDataPath={(row) => getTreeDataPath1(row)}
        getRowId={(row) => row.key}
        slots={{
          toolbar: QuickSearchToolbar,
        }}
      />
    </div>
  );
};

export default App;
