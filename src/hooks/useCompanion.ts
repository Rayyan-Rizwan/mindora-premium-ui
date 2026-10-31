import { useCallback, useEffect, useState } from "react";
import {
  COMPANION_EVENT,
  getCompanionCharacter,
  isCompanionCharacterId,
  resetCompanionCharacter,
  saveCompanionCharacter,
  type CompanionCharacter,
  type CompanionCharacterId,
} from "@/lib/companion";

export function useCompanion() {
  const [character, setCharacter] = useState<CompanionCharacter>(() =>
    getCompanionCharacter(),
  );

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<CompanionCharacterId>).detail;
      setCharacter(
        getCompanionCharacter(isCompanionCharacterId(detail) ? detail : null),
      );
    };
    window.addEventListener(COMPANION_EVENT, onChange);
    return () => window.removeEventListener(COMPANION_EVENT, onChange);
  }, []);

  const selectCharacter = useCallback((id: CompanionCharacterId) => {
    saveCompanionCharacter(id);
    setCharacter(getCompanionCharacter(id));
  }, []);

  const resetCharacter = useCallback(() => {
    resetCompanionCharacter();
    setCharacter(getCompanionCharacter());
  }, []);

  return {
    character,
    characterId: character.id,
    name: character.name,
    selectCharacter,
    resetCharacter,
  };
}
