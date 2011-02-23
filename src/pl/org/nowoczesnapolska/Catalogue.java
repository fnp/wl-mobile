package pl.org.nowoczesnapolska;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.ListView;

public class Catalogue extends Activity {
	static final private int MENU_SIGNIN = Menu.FIRST;
	static final private int MENU_SETTINGS = Menu.FIRST+1;	
	static final private int MENU_ABOUT = Menu.FIRST+2;
	
	static final String[] AUTHORS = new String[] {
		"Władysław Anczyc",
		"Hans Christian Andersen",
		"Adam Asnyk",
		"Autor nieznany",
		"Honoré de Balzac",
		"Michał Bałucki",
		"Charles Baudelaire",
		"Władysław Bełza",
		"Miłosz Biedrzycki",
		"August Bielowski",
		"George Gordon Byron",
		"Joseph Conrad",
		"Anton Czechow",
		"Józef Czechowicz",
		"Daniel Defoe",
		"Casimir Delavigne",
		"Antonina Domańska",
		"Alojzy Feliński",
		"Aleksander Fredro",
		"Johann Wolfgang von Goethe",
		"Bruno Jasieński",
		"Franciszek Karpiński",
		"Jan Kasprowicz",
		"Rudyard Kipling",
		"Jan Kochanowski",
		"Maria Konopnicka",
		"Franciszek Kowalski",
		"Ignacy Krasicki",
		"Zygmunt Krasiński",
		"Teofil Lenartowicz",
		"Bolesław Leśmian",
		"Adam Mickiewicz",
		"Molière",
		"Jan Andrzej Morsztyn",
		"Julian Ursyn Niemcewicz",
		"Cyprian Kamil Norwid",
		"Artur Oppman",
		"Eliza Orzeszkowa",
		"Edgar Allan Poe",
		"Wincenty Pol",
		"Ludwik Ksawery Pomian-Łubiński",
		"Bolesław Prus",
		"Kazimierz Przerwa-Tetmajer",
		"Władysław Stanisław Reymont",
		"Mikołaj Sęp Szarzyński",
		"William Shakespeare",
		"Henryk Sienkiewicz",
		"Juliusz Słowacki",
		"Sofokles",
		"Rajnold Suchodolski",
		"Wacław Święcicki",
		"Władysław Tarnowski",
		"Stanisław Ignacy Witkiewicz",
		"Stefan Witwicki",
		"Józef Wybicki",
		"Stanisław Wyspiański",
		"Gabriela Zapolska",
		"Stefan Żeromski"
	  };
	Context ctx;
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.catalogue);
        
        ctx = this;
        final ListView lv = (ListView) findViewById(R.id.catalogueListView);
        final EditText search = (EditText) findViewById(R.id.catalogueSearch);
        
        lv.setAdapter(new ArrayAdapter<String>(this, R.layout.catalogue_list_item, AUTHORS));        
        lv.setTextFilterEnabled(true);

        lv.setOnItemClickListener(new OnItemClickListener() {
        	@Override
        	public void onItemClick(AdapterView<?> parent, View view,
              int position, long id) {
        		startActivity(new Intent(ctx, CatalogueItem.class));
        	}
        });
        
        search.addTextChangedListener(new TextWatcher() {
			
			@Override
			public void onTextChanged(CharSequence s, int start, int before, int count) {
				lv.setFilterText(s.toString());	
			}
			
			@Override
			public void beforeTextChanged(CharSequence s, int start, int count,
					int after) {
				// TODO Auto-generated method stub
				
			}
			
			@Override
			public void afterTextChanged(Editable s) {
				// TODO Auto-generated method stub
				
			}
		});        
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
    	super.onCreateOptionsMenu(menu);

    	int groupId;
    	int menuItemId;
    	int menuItemOrder;
    	int menuItemText;

    	// settings
    	groupId = 0;
    	menuItemId = MENU_SIGNIN;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_signin;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	
    	// settings
    	groupId = 0;
    	menuItemId = MENU_SETTINGS;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_settings;    	
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);    	
    	
    	// about
    	groupId = 0;
    	menuItemId = MENU_ABOUT;
    	menuItemOrder = Menu.NONE;
    	menuItemText = R.string.menu_about;
    	
    	menu.add(groupId, menuItemId,
    			menuItemOrder, menuItemText);
    	    	
    	return true;
    }
    
    public boolean onOptionsItemSelected(MenuItem item) {
    	super.onOptionsItemSelected(item);
    	switch (item.getItemId()) {
    		case (MENU_SIGNIN):
    			startActivity(new Intent(ctx, SignIn.class));
    			return true;
    		case (MENU_SETTINGS):
    			startActivity(new Intent(ctx, Settings.class));
    			return true;
    		case (MENU_ABOUT):
    			startActivity(new Intent(ctx, About.class));
    			return true;    		
    	}

    	return false;    	
    }
    
}