import { Button } from '@frontend/components/ui/Button';
import { Input } from '@frontend/components/ui/Input';
import { Skeleton } from '@frontend/components/ui/Skeleton';
import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { Video } from 'youtube-sr';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState<Video[]>([]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const name = new FormData(event.currentTarget).get('name');
      const results = await window.api.youtube.search(name as string);

      setResults(results);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <Button variant='outline' onClick={() => setCount((prev) => prev + 1)} className='w-20'>
        Count: {count}
      </Button>

      <form className='flex flex-row gap-2' onSubmit={onSubmit}>
        <Input placeholder='Name...' className='w-96' name='name' />

        <Button variant='outline' type='submit'>
          greet
        </Button>
      </form>

      {loading && (
        <div className='flex flex-col gap-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className='w-1/3 h-20' />
          ))}
        </div>
      )}

      {results.map((result) => {
        return (
          <div className='bg-card p-5 rounded w-full flex flex-row gap-2' key={result.id}>
            <img src={result.thumbnail?.url} alt={result.title} className='w-20 h-20' />
            <div className='flex flex-col gap-2'>
              <span className='font-bold'>{result.title}</span>
              <span>{result.channel?.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
