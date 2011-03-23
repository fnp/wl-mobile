package pl.org.nowoczesnapolska;

public class CatalogueEntry {
	// type: 0 -- book, 1 -- tag
	private int type;
	private int id;
	private String name;
	public CatalogueEntry(int type, int id, String name){
		setType(type);
		setId(id);
		setName(name);
	}
	public void setType(int type) {
		this.type = type;
	}
	public int getType() {
		return type;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getId() {
		return id;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getName() {
		return name;
	}
}
