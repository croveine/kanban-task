import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Box, Typography, Paper } from '@mui/material';
import Card from './Board';

interface ColumnProps {
  title: string;
  cards: any[];
  droppableId: string;
}

const Column: React.FC<ColumnProps> = ({ title, cards, droppableId }) => {
  return (
    <Paper
      sx={{
        p: 2,
        width: 300,
        minHeight: 500,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{ minHeight: 400 }}
          >
            {cards.map((card, index) => (
              <Card key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

export default Column; 