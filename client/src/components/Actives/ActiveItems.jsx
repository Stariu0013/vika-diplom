import {Paper} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';

const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Назва', width: 300 },
    { field: 'activeCount', headerName: 'Кількість активів', width: 250 },
    {
        field: 'price',
        headerName: 'Ціна',
        type: 'number',
        width: 90,
    },
    {
        field: 'percents',
        headerName: 'Дохідність',
        description: 'This column has a value getter and is not sortable.',
        sortable: false,
        width: 160,
    },
    { field: 'risk', headerName: 'Ризик', width: 130 },
];

const paginationModel = { page: 0, pageSize: 5 };

const ActiveItems = ({items}) => {
    return (
        <Paper sx={{ height: 400, width: '100%', marginTop: 2 }}>
            <DataGrid
                rows={items}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                sx={{ border: 0 }}
            />
        </Paper>
    );
};

export default ActiveItems;