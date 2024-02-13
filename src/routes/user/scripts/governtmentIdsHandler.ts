import { getConnection } from "typeorm";
import { userInfoEntity } from "../../../entity/user/userInfoEntity";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { userEntity } from "../../../entity/user/userEntity";

const firebaseConfig = {
  apiKey: "AIzaSyDmRdEgwOYwaybSGP7B_MWofHYNBl9zAJo",
  authDomain: "clettr-firebase.firebaseapp.com",
  projectId: "clettr-firebase",
  storageBucket: "clettr-firebase.appspot.com",
  messagingSenderId: "631160755143",
  appId: "1:631160755143:web:783c0f90ce0d136b587fe2",
  measurementId: "G-BT14QDFFWB",
};

const app = initializeApp(firebaseConfig);

export async function governmentIdsHandler(req, res) {
  const { bsc_address, image_1, image_2, image_3 } = req.body;

  const user = await getConnection()
    .createQueryBuilder(userEntity, "user_entity")
    .select()
    .where("user_entity.bsc_address = :bsc_address", { bsc_address })
    .getOne();

  // console.log(image_1, user, bsc_address, " - userasd");

  if (user) {
    const image_array = [image_1, image_2, image_3];

    for (let i = 0; i < image_array.length; i++) {
      const image = image_array[i];
      if (image) {
        const storageRef = ref(
          getStorage(),
          `images/${user.bsc_address}/image_${i + 1}.jpg`
        );

        // Remove data URL prefix (if present)
        const base64String = image.replace(/^data:image\/\w+;base64,/, "");

        // Convert Base64 to a Uint8Array
        const binaryData = Uint8Array.from(atob(base64String), (c) =>
          c.charCodeAt(0)
        );

        await uploadBytes(storageRef, binaryData).then(async (snapshot) => {
          const link = await getDownloadURL(snapshot.ref);

          await getConnection()
            .createQueryBuilder()
            .update(userInfoEntity)
            .set(
              i == 0
                ? {
                    government_id: link,
                  }
                : i == 1
                ? {
                    government_id_1: link,
                  }
                : {
                    government_id_2: link,
                  }
            )
            .where(
              "user_id IN (SELECT id FROM user_entity WHERE bsc_address = :bsc_address)",
              {
                bsc_address: bsc_address,
              }
            )
            .execute();
        });
      }
    }

    return res.status(200).send({
      success: true,
      message: "Uploaded Government Id.",
    });
  } else {
    return res.status(200).send({
      success: false,
      message: "Unable to upload.",
    });
  }
}
