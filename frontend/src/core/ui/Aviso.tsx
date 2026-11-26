import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type TipoAviso = 'sucesso' | 'erro' | 'atencao';

interface ItemAviso {
  id: number;
  mensagem: string;
  tipo: TipoAviso;
}

interface ContextoAviso {
  avisar: (mensagem: string, tipo?: TipoAviso) => void;
}

const Contexto = createContext<ContextoAviso>({ avisar: () => undefined });

/** Provedor dos avisos (toasts). Já está montado em App.tsx. */
export function ProvedorAvisos({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<ItemAviso[]>([]);
  const proximoId = useRef(1);

  const avisar = useCallback((mensagem: string, tipo: TipoAviso = 'sucesso') => {
    const id = proximoId.current++;
    setAvisos((lista) => [...lista, { id, mensagem, tipo }]);
    setTimeout(
      () => setAvisos((lista) => lista.filter((a) => a.id !== id)),
      tipo === 'erro' ? 5000 : 2600,
    );
  }, []);

  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`aviso ${a.tipo !== 'sucesso' ? `aviso--${a.tipo}` : ''}`}>
            {a.mensagem}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  );
}

/** `const { avisar } = useAviso(); avisar('Venda registrada');` */
export function useAviso(): ContextoAviso {
  return useContext(Contexto);
}
