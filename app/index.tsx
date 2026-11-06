import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Course = "Starter" | "Main" | "Dessert";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  course: Course;
  price: number;
};

const COURSES: Course[] = ["Starter", "Main", "Dessert"];

export default function MenuScreen() {
  const [items, setItems] = useState<MenuItem[]>([]);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [course, setCourse] = useState<Course | null>(null);
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // search, filter, delete confirmation
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Course | "All">("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCourse(null);
    setPrice("");
    setEditingId(null);
    setErrors([]);
  };

  const validate = (): string[] => {
    const problems: string[] = [];
    if (!name.trim()) problems.push("Dish name is required.");
    if (!description.trim()) problems.push("Description is required.");
    if (!course) problems.push("Pick a course.");
    const parsed = Number(price.replace(",", "."));
    if (!price.trim()) problems.push("Price is required.");
    else if (isNaN(parsed) || parsed <= 0)
      problems.push("Price must be a number greater than 0.");
    return problems;
  };

  const handleSave = () => {
    const problems = validate();
    if (problems.length > 0) {
      setErrors(problems);
      setMessage("");
      return;
    }

    const cleaned = {
      name: name.trim(),
      description: description.trim(),
      course: course as Course,
      price: Number(price.replace(",", ".")),
    };

    if (editingId) {
      setItems((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, ...cleaned } : i))
      );
      setMessage(`"${cleaned.name}" updated.`);
    } else {
      setItems((prev) => [
        ...prev,
        { id: Date.now().toString(), ...cleaned },
      ]);
      setMessage(`"${cleaned.name}" added to the menu.`);
    }
    resetForm();
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setCourse(item.course);
    setPrice(item.price.toString());
    setErrors([]);
    setMessage("");
    setDeleteId(null);
  };

  const confirmDelete = (item: MenuItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (editingId === item.id) resetForm();
    setDeleteId(null);
    setMessage(`"${item.name}" deleted.`);
  };

  // search + filter
  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      (i) =>
        (filter === "All" || i.course === filter) &&
        (q === "" || i.name.toLowerCase().includes(q))
    );
  }, [items, search, filter]);

  // statistics (based on the whole menu, not the filtered view)
  const stats = useMemo(() => {
    const total = items.length;
    const average =
      total === 0 ? 0 : items.reduce((sum, i) => sum + i.price, 0) / total;
    const perCourse = COURSES.map((c) => ({
      course: c,
      count: items.filter((i) => i.course === c).length,
    }));
    return { total, average, perCourse };
  }, [items]);

  const header = (
    <View>
      <Text style={styles.title}>Chef's Menu Manager</Text>

      {/* Form */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {editingId ? "Edit dish" : "Add a dish"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Dish name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Course</Text>
        <View style={styles.chipRow}>
          {COURSES.map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, course === c && styles.chipActive]}
              onPress={() => setCourse(c)}
            >
              <Text
                style={[styles.chipText, course === c && styles.chipTextActive]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Price (e.g. 89.50)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        {errors.map((e) => (
          <Text key={e} style={styles.error}>
            {e}
          </Text>
        ))}

        <View style={styles.row}>
          <Pressable style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>
              {editingId ? "Save changes" : "Add dish"}
            </Text>
          </Pressable>
          {editingId && (
            <Pressable style={styles.ghostBtn} onPress={resetForm}>
              <Text style={styles.ghostBtnText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      {message !== "" && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{message}</Text>
        </View>
      )}

      {/* Statistics */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Menu statistics</Text>
        <Text style={styles.statLine}>Total items: {stats.total}</Text>
        <Text style={styles.statLine}>
          Average price: R{stats.average.toFixed(2)}
        </Text>
        {stats.perCourse.map((s) => (
          <Text key={s.course} style={styles.statLine}>
            {s.course}s: {s.count}
          </Text>
        ))}
      </View>

      {/* Search + filter */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Find a dish</Text>
        <TextInput
          style={styles.input}
          placeholder="Search by dish name"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.chipRow}>
          {(["All", ...COURSES] as const).map((c) => (
            <Pressable
              key={c}
              style={[styles.chip, filter === c && styles.chipActive]}
              onPress={() => setFilter(c)}
            >
              <Text
                style={[styles.chipText, filter === c && styles.chipTextActive]}
              >
                {c}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitleOuter}>
        Menu ({visibleItems.length}
        {visibleItems.length !== items.length ? ` of ${items.length}` : ""})
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          data={visibleItems}
          keyExtractor={(i) => i.id}
          ListHeaderComponent={header}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text style={styles.empty}>
              {items.length === 0
                ? "No dishes yet. Add your first one above."
                : "No dishes match your search or filter."}
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.itemTop}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>R{item.price.toFixed(2)}</Text>
              </View>
              <Text style={styles.itemCourse}>{item.course}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>

              {deleteId === item.id ? (
                <View style={styles.row}>
                  <Text style={styles.confirmText}>Delete this dish?</Text>
                  <Pressable
                    style={styles.dangerBtn}
                    onPress={() => confirmDelete(item)}
                  >
                    <Text style={styles.primaryBtnText}>Yes, delete</Text>
                  </Pressable>
                  <Pressable
                    style={styles.ghostBtn}
                    onPress={() => setDeleteId(null)}
                  >
                    <Text style={styles.ghostBtnText}>Keep</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.row}>
                  <Pressable
                    style={styles.ghostBtn}
                    onPress={() => startEdit(item)}
                  >
                    <Text style={styles.ghostBtnText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={styles.ghostBtn}
                    onPress={() => setDeleteId(item.id)}
                  >
                    <Text style={[styles.ghostBtnText, { color: DANGER }]}>
                      Delete
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const INK = "#1B2A2F";
const GREEN = "#0F6B5C";
const DANGER = "#B3261E";
const LINE = "#D9DED9";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7F5" },
  content: { padding: 16, paddingBottom: 48, maxWidth: 640, width: "100%", alignSelf: "center" },
  title: { fontSize: 28, fontWeight: "800", color: INK, marginBottom: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: LINE,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: INK, marginBottom: 10 },
  sectionTitleOuter: { fontSize: 18, fontWeight: "700", color: INK, marginBottom: 10 },
  label: { fontSize: 14, color: INK, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#FAFBFA",
    color: INK,
  },
  multiline: { minHeight: 64, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: "#fff",
  },
  chipActive: { backgroundColor: GREEN, borderColor: GREEN },
  chipText: { color: INK, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 4 },
  primaryBtn: { backgroundColor: GREEN, paddingVertical: 11, paddingHorizontal: 18, borderRadius: 8 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  dangerBtn: { backgroundColor: DANGER, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8 },
  ghostBtn: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  ghostBtnText: { color: INK, fontWeight: "600" },
  error: { color: DANGER, marginBottom: 4, fontSize: 14 },
  banner: {
    backgroundColor: "#E3F1ED",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: GREEN,
  },
  bannerText: { color: GREEN, fontWeight: "600" },
  statLine: { fontSize: 16, color: INK, marginBottom: 4 },
  empty: { color: "#5B6B6F", textAlign: "center", marginTop: 12, fontSize: 15 },
  itemCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: LINE,
  },
  itemTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  itemName: { fontSize: 18, fontWeight: "700", color: INK, flexShrink: 1 },
  itemPrice: { fontSize: 18, fontWeight: "700", color: GREEN },
  itemCourse: { color: GREEN, fontWeight: "600", marginTop: 2 },
  itemDesc: { color: "#46575B", marginTop: 6, marginBottom: 8, fontSize: 15 },
  confirmText: { color: DANGER, fontWeight: "600" },
});
