import { useEffect, useState, type ReactNode } from 'react';

type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; data: T };

type Props<T> = {
  title: string;
  description: string;
  load: () => Promise<T>;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  renderContent: (data: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, load, emptyMessage, isEmpty, renderContent }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    load()
      .then((data) => {
        if (active) setState({ status: 'loaded', data });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'Unexpected request failure',
          });
        }
      });

    return () => {
      active = false;
    };
  }, [load]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : state.status === 'error' ? (
          <>
            <p role="alert">Unable to load {title.toLowerCase()}. Please try again.</p>
            <details>
              <summary>Error details</summary>
              <p>{state.message}</p>
            </details>
          </>
        ) : isEmpty(state.data) ? (
          <p>{emptyMessage}</p>
        ) : (
          renderContent(state.data)
        )}
      </div>
    </section>
  );
}
