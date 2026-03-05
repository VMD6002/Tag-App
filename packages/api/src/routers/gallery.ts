import { ORPCError, os } from "@orpc/server";
import { pathExists, readJSON, writeJSON } from "fs-extra";
import z from "zod";
import { generateGalleryData } from "../lib/generateGalleryData";
import { rm } from "node:fs/promises";

const galleryExistsCheck = async (name: string, id: string) => {
  if (!(await pathExists(`./media/Galleries/${name}.${id}`))) {
    throw new ORPCError("NOT_FOUND", {
      message: `Gallery with name ${name} and ID ${id} doesn't exist`,
    });
  }
};

export const getGalleryData = os
  .input(z.object({ name: z.string(), id: z.string() }))
  .handler(async ({ input }) => {
    const { name, id } = input;

    if (!name || !id) {
      throw new ORPCError("NOT_ACCEPTABLE", {
        message: `Blank Gallery Name or ID`,
      });
    }

    await galleryExistsCheck(name, id);

    try {
      const data: Awaited<ReturnType<typeof generateGalleryData>> =
        await readJSON(`./media/Galleries/${name}.${id}/gallery-data.json`);
      return data;
    } catch {
      const data = await generateGalleryData(`${name}.${id}`);
      await writeJSON(
        `./media/Galleries/${name}.${id}/gallery-data.json`,
        data,
      );
      return data;
    }
  });

export const refreshGalleryData = os
  .input(z.object({ name: z.string(), id: z.string() }))
  .handler(async ({ input }) => {
    const { name, id } = input;

    if (!name || !id) {
      throw new ORPCError("NOT_ACCEPTABLE", {
        message: `Blank Gallery Name or ID`,
      });
    }

    await galleryExistsCheck(name, id);

    const data = await generateGalleryData(`${name}.${id}`);
    await writeJSON(`./media/Galleries/${name}.${id}/gallery-data.json`, data);
    return data;
  });

export const removeGalleryContents = os
  .input(
    z.object({
      name: z.string(),
      id: z.string(),
      contents: z.string().array(),
    }),
  )
  .handler(async ({ input }) => {
    const { name, id, contents } = input;

    if (!name || !id || !contents.length) {
      throw new ORPCError("NOT_ACCEPTABLE", {
        message: `Blank Gallery Name or ID or Contents`,
      });
    }

    await galleryExistsCheck(name, id);

    await Promise.all(
      contents.map((content) =>
        rm(`./media/Galleries/${name}.${id}/${content}`, {
          recursive: true,
          force: true,
        }),
      ),
    );

    const newGalleryData = await generateGalleryData(`${name}.${id}`);
    await writeJSON(
      `./media/Galleries/${name}.${id}/gallery-data.json`,
      newGalleryData,
    );

    return newGalleryData;
  });
