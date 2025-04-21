import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Container, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material';

const BookListPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/books')
      .then((res) => setBooks(res.data.books || res.data))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Book List
      </Typography>
      <Grid container spacing={2}>
        {books.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{book.title}</Typography>
                <Typography variant="subtitle1">{book.author}</Typography>
                <Typography variant="body2">ISBN: {book.isbn}</Typography>
                <Typography variant="body2">Copies: {book.copies}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BookListPage;
