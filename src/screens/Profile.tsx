import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, ScrollView, Text, VStack, Skeleton, Heading, useToast } from "native-base";
import { useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";

const PHOTO_SIZE = 33;

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    oldPassword: string;
    confirm_password: string;
}

export function Profile() {
    const [photoIsLoading, setPhotoIsLoading] = useState(false);
    const [userPhoto, setUserPhoto] = useState('https://github.com/lucasfelizari.png');
    const toast = useToast();
    const { user } = useAuth();
    const { control } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email,
        }
    });

    async function handleUserPhotoSelect() {
        try {
            setPhotoIsLoading(true);
            const photoSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true,
            });
            if (photoSelected.canceled) {
                return;
            }
            if (photoSelected.assets[0].uri) {
                const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
                if (photoInfo.exists && (photoInfo.size / 1024 / 1024) > 0) {
                    return toast.show({
                        title: 'A imagem deve ter no máximo 5MB',
                        placement: 'top',
                        bgColor: 'red.500',
                    });
                }
                setUserPhoto(photoSelected.assets[0].uri)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setPhotoIsLoading(false);
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title="Perfil" />
            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt={6} px={10}>
                    {photoIsLoading ?
                        <Skeleton
                            w={PHOTO_SIZE}
                            h={PHOTO_SIZE}
                            rounded="full"
                            startColor="gray.500"
                            endColor="gray.400"
                        />
                        :
                        <UserPhoto
                            source={{ uri: userPhoto }}
                            alt="Foto do usuário"
                            size={PHOTO_SIZE}
                        />
                    }
                    <TouchableOpacity onPress={handleUserPhotoSelect}>
                        <Text color="green.500" fontWeight="bold" fontSize="md" mt={2} mb={8}>
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                bg="gray.600"
                                placeholder="Nome"
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <Input
                                bg="gray.600"
                                placeholder="E-mail"
                                isDisabled
                                onChangeText={onChange}
                                value={value}
                            />
                        )}
                    />

                    <Heading
                        color="gray.200"
                        fontSize="md"
                        mb={2}
                        alignSelf="flex-start"
                        mt={12}
                        fontFamily="heading"
                    >
                        Alterar senha
                    </Heading>
                    <Input
                        bg="gray.600"
                        placeholder="Senha antiga"
                        secureTextEntry
                    />
                    <Input
                        bg="gray.600"
                        placeholder="Nova senha"
                        secureTextEntry
                    />
                    <Input
                        bg="gray.600"
                        placeholder="Confirmar nova senha"
                        secureTextEntry
                    />
                    <Button
                        title="Atualizar"
                        mt={4}
                    />
                </Center>
            </ScrollView>
        </VStack>
    );
}