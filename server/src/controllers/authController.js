import {
  createPlayer,
  getPlayerByPseudo,
  setPlayerOnlineStatus,
} from "../repositories/playerRepository.js";
import { logger } from "../utils/logger.js";
import { PSEUDO_REGEX } from "../utils/constants.js";

export const login = async (req, res) => {
  const pseudo = req.body?.pseudo?.trim();

  if (!pseudo) {
    return res.status(400).json({ message: "pas de pseudo" });
  }

  if (!PSEUDO_REGEX.test(pseudo)) {
    return res.status(400).json({
      message: "Le pseuso ne correspond pas au format attendu",
    });
  }

  try {
    let player = await getPlayerByPseudo(pseudo);

    if (!player) {
      player = await createPlayer({ pseudo });
    }

    const updatedPlayer = await setPlayerOnlineStatus(pseudo, true);

    res.json({
      player: {
        id: updatedPlayer.id,
        pseudo: updatedPlayer.pseudo,
        stats: updatedPlayer.stats,
      },
    });
  } catch (error) {
    logger.error("Erreur dans le login", error);
    res.status(500).json({ message: "Unable to login" });
  }
};
