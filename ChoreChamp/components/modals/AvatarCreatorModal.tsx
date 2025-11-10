import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { SvgXml } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { generateAvatarSvg, AvatarData } from "@/lib/avatarUtils";
import {
  HAIR_OPTIONS,
  HAIR_COLORS,
  BEARD_OPTIONS,
  BEARD_COLORS,
  SKIN_COLOR,
  EYE_OPTIONS,
  EYEBROW_OPTIONS,
  MOUTH_OPTIONS,
  CLOTHES_OPTIONS,
  CLOTHES_COLORS,
  ACCESSORIES_OPTIONS,
  ACCESSORIES_COLORS,
} from "@/constants/avatarConfig";

interface AvatarCreatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (avatarData: AvatarData) => void;
  initialAvatarData?: AvatarData;
}

export default function AvatarCreatorModal({
  visible,
  onClose,
  onSave,
  initialAvatarData,
}: AvatarCreatorModalProps) {
  const { colors } = useTheme();

  // State with all avatar data
  const [avatarData, setAvatarData] = useState<AvatarData>({
    hair: HAIR_OPTIONS[0],
    hairColor: HAIR_COLORS[0],
    beard: BEARD_OPTIONS[0],
    beardColor: BEARD_COLORS[0],
    skin: SKIN_COLOR[0],
    eyes: EYE_OPTIONS[0],
    eyebrows: EYEBROW_OPTIONS[0],
    mouth: MOUTH_OPTIONS[0],
    clothes: CLOTHES_OPTIONS[0],
    clothesColor: CLOTHES_COLORS[0],
    accessories: ACCESSORIES_OPTIONS[0],
    accessoriesColor: ACCESSORIES_COLORS[0],
  });

  // Reset to initial values when modal opens
  useEffect(() => {
    if (visible && initialAvatarData) {
      setAvatarData(initialAvatarData);
    }
  }, [visible, initialAvatarData]);

  const avatarSvg = useMemo(() => generateAvatarSvg(avatarData), [avatarData]);

  // Helper function to update a field
  const updateField = (field: keyof AvatarData, value: string) => {
    setAvatarData((prev) => ({ ...prev, [field]: value }));
  };

  /* Helper function to cycle through an array created by Claude.
  Prompt: Jeg har masse repeterende kode i AvatarCreatorModal. 
  For hver avatar-customization (hår, skjegg, øyne osv.) har jeg nesten identisk kode for å navigere frem og tilbake i arrays. 
  Hvordan kan jeg forenkle dette til én gjenbrukbar funksjon?
  */
  const cycleOption = (
    field: keyof AvatarData,
    options: string[],
    direction: "next" | "prev"
  ) => {
    const currentIndex = options.indexOf(avatarData[field]);
    let newIndex: number;

    if (direction === "next") {
      newIndex = (currentIndex + 1) % options.length;
    } else {
      newIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
    }

    updateField(field, options[newIndex]);
  };

  const handleSave = () => {
    onSave(avatarData);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: colors.contextBackground },
          ]}
        >
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.text }]}>
              Avbryt
            </Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Lag avatar
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={[styles.saveText, { color: colors.tint }]}>Lagre</Text>
          </TouchableOpacity>
        </View>

        {/* Fixed Avatar Preview */}
        <View
          style={[
            styles.fixedPreviewSection,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.contextBackground,
            },
          ]}
        >
          <View style={styles.avatarPreview}>
            <SvgXml xml={avatarSvg} width={120} height={120} />
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Hair and haircolor */}
          <View style={styles.rowSection}>
            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Hår
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("hair", HAIR_OPTIONS, "prev")}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {HAIR_OPTIONS.indexOf(avatarData.hair) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("hair", HAIR_OPTIONS, "next")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Hårfarge
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("hairColor", HAIR_COLORS, "prev")}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: `#${avatarData.hairColor}` },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("hairColor", HAIR_COLORS, "next")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Beard and beard color */}
          <View style={styles.rowSection}>
            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Skjegg
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("beard", BEARD_OPTIONS, "prev")}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {BEARD_OPTIONS.indexOf(avatarData.beard) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("beard", BEARD_OPTIONS, "next")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Skjeggfarge
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("beardColor", BEARD_COLORS, "prev")
                  }
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: `#${avatarData.beardColor}`,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("beardColor", BEARD_COLORS, "next")
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Eyes and eyebrows */}
          <View style={styles.rowSection}>
            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Øyne
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("eyes", EYE_OPTIONS, "prev")}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {EYE_OPTIONS.indexOf(avatarData.eyes) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("eyes", EYE_OPTIONS, "next")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Øyenbryn
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("eyebrows", EYEBROW_OPTIONS, "prev")
                  }
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {EYEBROW_OPTIONS.indexOf(avatarData.eyebrows) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("eyebrows", EYEBROW_OPTIONS, "next")
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Mouth and skin color */}
          <View style={styles.rowSection}>
            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Munn
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("mouth", MOUTH_OPTIONS, "prev")}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {MOUTH_OPTIONS.indexOf(avatarData.mouth) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("mouth", MOUTH_OPTIONS, "next")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Hudfarge
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("skin", SKIN_COLOR, "prev")}
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View
                  style={[
                    styles.colorPreview,
                    { backgroundColor: `#${avatarData.skin}` },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() => cycleOption("skin", SKIN_COLOR, "next")}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Clothes and clothes color */}
          <View style={styles.rowSection}>
            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Klær
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("clothes", CLOTHES_OPTIONS, "prev")
                  }
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {CLOTHES_OPTIONS.indexOf(avatarData.clothes) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("clothes", CLOTHES_OPTIONS, "next")
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Klesfarge
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("clothesColor", CLOTHES_COLORS, "prev")
                  }
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: `#${avatarData.clothesColor}`,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("clothesColor", CLOTHES_COLORS, "next")
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Accessories and accessories color */}
          <View style={styles.rowSection}>
            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Tilbehør
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("accessories", ACCESSORIES_OPTIONS, "prev")
                  }
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <Text
                  style={[styles.valueText, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {ACCESSORIES_OPTIONS.indexOf(avatarData.accessories) + 1}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("accessories", ACCESSORIES_OPTIONS, "next")
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Tilbehørfarge
              </Text>
              <View style={styles.arrowSelector}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("accessoriesColor", ACCESSORIES_COLORS, "prev")
                  }
                >
                  <Ionicons name="chevron-back" size={20} color={colors.text} />
                </TouchableOpacity>
                <View
                  style={[
                    styles.colorPreview,
                    {
                      backgroundColor: `#${avatarData.accessoriesColor}`,
                    },
                  ]}
                />
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    { backgroundColor: colors.contextBackground },
                  ]}
                  onPress={() =>
                    cycleOption("accessoriesColor", ACCESSORIES_COLORS, "next")
                  }
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  fixedPreviewSection: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  rowSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 16,
  },
  halfSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  arrowSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arrowButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
  },
  colorPreview: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#000",
  },
});
